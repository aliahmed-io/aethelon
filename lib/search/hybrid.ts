
import prisma from "@/lib/db";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { Product } from "@prisma/client";

/**
 * Result of a hybrid search query.
 * Extends the Product type with a relevance score.
 */
export interface HybridSearchResult extends Product {
    relevance: number;
    vectorScore: number;
    textScore: number;
    categoryName?: string;
}

interface SearchOptions {
    query: string;
    limit?: number;
    category?: string;
    minPrice?: number; // Cents
    maxPrice?: number; // Cents
    inStock?: boolean;
}

/**
 * Performs a hybrid search using both Vector Similarity and Full-Text Search.
 * 
 * Logic:
 * 1. Generate embedding for the query.
 * 2. Execute Raw SQL to calculating:
 *    - Cosine Similarity (1 - cosine distance)
 *    - TS Rank (Text match quality)
 * 3. Combine scores with weights (e.g., 70% Vector, 30% Text).
 * 4. Apply filters (Price, Category, Stock).
 */
export async function searchProductsHybrid(options: SearchOptions): Promise<HybridSearchResult[]> {
    const { query, limit = 20, category, minPrice, maxPrice, inStock } = options;

    if (!query || !query.trim()) {
        return [];
    }

    // 1. Generate Query Embedding
    const embedding = await generateEmbedding(query);

    if (!embedding) {
        console.warn("Hybrid Search: Embedding generation failed, executing Advanced Lexical Fallback.");

        // Advanced Lexical Search (Postgres Native)
        // Uses websearch_to_tsquery to handle complex operators "or", "and", and phrases automatically.
        const fallbackResults = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.images,
                p."mainCategory",
                p."stockQuantity",
                p."averageRating",
                p."reviewCount",
                c.name as "categoryName",
                0 as vector_score,
                ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description || ' ' || coalesce(p.style, '') || ' ' || array_to_string(p.tags, ' ')), websearch_to_tsquery('english', $1)) as text_score
            FROM "Product" p
            LEFT JOIN "_CategoryToProduct" cp ON p.id = cp."B"
            LEFT JOIN "Category" c ON cp."A" = c.id
            WHERE 
                p.status = 'published'
                ${category && category !== 'all' ? `AND c.name ILIKE '%${category}%'` : ''}
                ${minPrice !== undefined ? `AND p.price >= ${minPrice}` : ''}
                ${maxPrice !== undefined ? `AND p.price <= ${maxPrice}` : ''}
                ${inStock ? `AND p."stockQuantity" > 0` : ''}
                AND to_tsvector('english', p.name || ' ' || p.description || ' ' || coalesce(p.style, '') || ' ' || array_to_string(p.tags, ' ')) @@ websearch_to_tsquery('english', $1)
            ORDER BY (
                ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description || ' ' || coalesce(p.style, '') || ' ' || array_to_string(p.tags, ' ')), websearch_to_tsquery('english', $1)) +
                (log(p."reviewCount" + 1) * 0.05) + 
                (CASE WHEN p."stockQuantity" > 0 THEN 0.1 ELSE 0 END) 
            ) DESC
            LIMIT $2;
        `, query, limit);

        return fallbackResults.map((r: any) => ({
            ...r,
            categoryName: r.categoryName,
            relevance: r.text_score,
            vectorScore: 0,
            textScore: r.text_score
        }));
    }

    // 2. Construct Raw SQL with Safe Parameters for Hybrid Search
    const vectorString = `[${embedding.join(',')}]`;

    // Params: $1=vector, $2=query, $3=limit
    const sqlParams: any[] = [vectorString, query, limit];
    let paramIndex = 4; // Start dynamic params from $4

    const filterClauses = [`status = 'published'`];

    // Category Filter
    if (category && category !== 'all') {
        // Use implicit M-N table _CategoryToProduct
        // A = CategoryId, B = ProductId
        filterClauses.push(`id IN (SELECT "B" FROM "_CategoryToProduct" JOIN "Category" ON "A" = "Category".id WHERE "Category".name ILIKE $${paramIndex})`);
        sqlParams.push(`%${category}%`);
        paramIndex++;
    }

    // Price Filters
    if (minPrice !== undefined) {
        filterClauses.push(`price >= $${paramIndex}`);
        sqlParams.push(minPrice);
        paramIndex++;
    }

    if (maxPrice !== undefined) {
        filterClauses.push(`price <= $${paramIndex}`);
        sqlParams.push(maxPrice);
        paramIndex++;
    }

    // Stock Filter
    if (inStock) {
        filterClauses.push(`"stockQuantity" > 0`);
    }

    const whereSql = filterClauses.join(" AND ");
    const VECTOR_WEIGHT = 0.7; // Boost semantic relevance
    const TEXT_WEIGHT = 0.3;

    try {
        const results = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.images,
                p."mainCategory",
                p."stockQuantity",
                p."averageRating",
                p."reviewCount",
                c.name as "categoryName",
                1 - (p.embedding <=> $1::vector) as vector_score,
                ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description || ' ' || coalesce(p.style, '') || ' ' || array_to_string(p.tags, ' ')), websearch_to_tsquery('english', $2)) as text_score
            FROM "Product" p
            LEFT JOIN "_CategoryToProduct" cp ON p.id = cp."B"
            LEFT JOIN "Category" c ON cp."A" = c.id
            WHERE 
                ${whereSql.replace(/"/g, 'p."').replace(/status/g, 'p.status').replace(/price/g, 'p.price').replace(/stockQuantity/g, 'p."stockQuantity"')}
                AND (
                    (1 - (p.embedding <=> $1::vector)) > 0.5 -- Semantic Threshold
                    OR
                    to_tsvector('english', p.name || ' ' || p.description || ' ' || coalesce(p.style, '') || ' ' || array_to_string(p.tags, ' ')) @@ websearch_to_tsquery('english', $2)
                )
            ORDER BY (
                (1 - (p.embedding <=> $1::vector)) * ${VECTOR_WEIGHT} + 
                ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description || ' ' || coalesce(p.style, '') || ' ' || array_to_string(p.tags, ' ')), websearch_to_tsquery('english', $2)) * ${TEXT_WEIGHT} +
                (log(p."reviewCount" + 1) * 0.05) + 
                (CASE WHEN p."stockQuantity" > 0 THEN 0.1 ELSE 0 END) 
            ) DESC
            LIMIT $3;
        `, ...sqlParams);

        // Map and normalize scores
        return results.map((r: any) => ({
            ...r,
            categoryName: r.categoryName,
            relevance: (r.vector_score * VECTOR_WEIGHT) + (r.text_score * TEXT_WEIGHT),
            vectorScore: r.vector_score,
            textScore: r.text_score
        }));

    } catch (error) {
        console.error("Hybrid Search Error:", error);
        return [];
    }
}


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
        console.warn("Hybrid Search: Embedding generation failed, falling back to text-only.");
        return [];
    }

    // 2. Construct Raw SQL with Safe Parameters
    const vectorString = `[${embedding.join(',')}]`;

    // Params: $1=vector, $2=query, $3=limit
    const sqlParams: any[] = [vectorString, query, limit];
    let paramIndex = 4; // Start dynamic params from $4

    const filterClauses = [`status = 'published'`];

    // Category Filter
    if (category && category !== 'all') {
        if (["MEN", "WOMEN", "KIDS"].includes(category.toUpperCase())) {
            // Whitelisted enum value, safe to interpolate
            filterClauses.push(`"mainCategory" = '${category.toUpperCase()}'`);
        } else {
            // Dynamic string, use parameter
            filterClauses.push(`"categoryId" IN (SELECT id FROM "Category" WHERE name ILIKE $${paramIndex})`);
            sqlParams.push(`%${category}%`);
            paramIndex++;
        }
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
                id,
                name,
                description,
                price,
                images,
                "mainCategory",
                "stockQuantity",
                "averageRating",
                "reviewCount",
                "categoryId",
                1 - (embedding <=> $1::vector) as vector_score,
                ts_rank_cd(to_tsvector('english', name || ' ' || description), plainto_tsquery('english', $2)) as text_score
            FROM "Product"
            WHERE 
                ${whereSql}
                AND (
                    (1 - (embedding <=> $1::vector)) > 0.5 -- Semantic Threshold
                    OR
                    to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', $2)
                )
            ORDER BY (
                (1 - (embedding <=> $1::vector)) * ${VECTOR_WEIGHT} + 
                ts_rank_cd(to_tsvector('english', name || ' ' || description), plainto_tsquery('english', $2)) * ${TEXT_WEIGHT} +
                (log("reviewCount" + 1) * 0.05) + -- Popularity Boost (Logarithmic)
                (CASE WHEN "stockQuantity" > 0 THEN 0.1 ELSE 0 END) -- In-Stock Boost
            ) DESC
            LIMIT $3;
        `, ...sqlParams);

        // Map and normalize scores
        return results.map((r: any) => ({
            ...r,
            relevance: (r.vector_score * VECTOR_WEIGHT) + (r.text_score * TEXT_WEIGHT),
            vectorScore: r.vector_score,
            textScore: r.text_score
        }));

    } catch (error) {
        console.error("Hybrid Search Error:", error);
        return [];
    }
}

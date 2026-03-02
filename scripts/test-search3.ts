import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
    log: ['error']
}).$extends(withAccelerate());

async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text.trim());
        return result.embedding.values;
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
}

async function runHybridSearch(query: string, limit: number) {
    if (!query) return [];

    console.log("Generating embedding for query:", query);
    const embedding = await generateEmbedding(query);
    if (!embedding) throw new Error("Embedding failed");

    const vectorString = `[${embedding.join(',')}]`;
    const sqlParams: any[] = [vectorString, query, limit];
    const whereSql = `p.status = 'published'`;

    const VECTOR_WEIGHT = 0.7;
    const TEXT_WEIGHT = 0.3;

    console.log("Executing raw SQL...");
    const results = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p."stockQuantity",
            p."averageRating",
            c.name as "categoryName",
            1 - (p.embedding <=> $1::vector) as vector_score,
            ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description), plainto_tsquery('english', $2)) as text_score
        FROM "Product" p
        LEFT JOIN "_CategoryToProduct" cp ON p.id = cp."B"
        LEFT JOIN "Category" c ON cp."A" = c.id
        WHERE 
            ${whereSql}
            AND (
                (1 - (p.embedding <=> $1::vector)) > 0.5 
                OR
                to_tsvector('english', p.name || ' ' || p.description) @@ plainto_tsquery('english', $2)
            )
        ORDER BY (
            (1 - (p.embedding <=> $1::vector)) * ${VECTOR_WEIGHT} + 
            ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description), plainto_tsquery('english', $2)) * ${TEXT_WEIGHT}
        ) DESC
        LIMIT $3;
    `, ...sqlParams);

    return results;
}

async function run() {
    try {
        console.log("Testing Advanced Hybrid Search (Vector + Text)");
        const results = await runHybridSearch("a comfortable chair for reading", 5);

        console.log(`\n--- Results (${results.length}) ---`);
        results.forEach((r: any, i: number) => {
            const rel = ((r.vector_score || 0) * 0.7) + ((r.text_score || 0) * 0.3);
            console.log(`${i + 1}. ${r.name} (Relevance: ${rel.toFixed(3)} | Vector: ${r.vector_score?.toFixed(3)} | Text: ${r.text_score?.toFixed(3)})`);
            console.log(`   Description: ${r.description?.substring(0, 80)}...`);
            console.log(`   Category: ${r.categoryName || 'None'}\n`);
        });
    } catch (e) {
        console.error("Failed:", e);
    }
}
run();

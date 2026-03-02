import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ['error'] });

async function run() {
    const query = "a comfortable chair for reading";
    console.log("Testing text-only fallback search for:", query);

    const fallbackResults = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
            p.id,
            p.name,
            p.description,
            p.price,
            p."stockQuantity",
            p."averageRating",
            c.name as "categoryName",
            ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description), websearch_to_tsquery('english', $1)) as text_score
        FROM "Product" p
        LEFT JOIN "_CategoryToProduct" cp ON p.id = cp."B"
        LEFT JOIN "Category" c ON cp."A" = c.id
        WHERE 
            p.status = 'published'
            AND to_tsvector('english', p.name || ' ' || p.description) @@ websearch_to_tsquery('english', $1)
        ORDER BY 
            ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description), websearch_to_tsquery('english', $1)) DESC
        LIMIT $2;
    `, query, 5);

    console.log(`\n--- Lexical Results (${fallbackResults.length}) ---`);
    fallbackResults.forEach((r: any, i: number) => {
        console.log(`${i + 1}. ${r.name} (Text Score: ${r.text_score?.toFixed(3)})`);
    });
}
run();

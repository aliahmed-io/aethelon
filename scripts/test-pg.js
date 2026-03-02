const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        await client.connect();

        const query = "a comfortable chair for reading";
        console.log(`Executing advanced Postgres Lexical Search across products for: "${query}"\n`);

        const res = await client.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p."stockQuantity",
                ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description), websearch_to_tsquery('english', $1)) as text_score
            FROM "Product" p
            WHERE 
                p.status = 'published'
                AND to_tsvector('english', p.name || ' ' || p.description) @@ websearch_to_tsquery('english', $1)
            ORDER BY 
                ts_rank_cd(to_tsvector('english', p.name || ' ' || p.description), websearch_to_tsquery('english', $1)) DESC
            LIMIT 5;
        `, [query]);

        if (res.rows.length === 0) {
            console.log("No matching products found using fallback algorithm.");
        } else {
            res.rows.forEach((row, idx) => {
                console.log(`${idx + 1}. ${row.name} (Score: ${Number(row.text_score).toFixed(4)})`);
            });
        }

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await client.end();
    }
}

run();

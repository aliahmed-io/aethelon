import { searchProductsHybrid } from "../lib/search/hybrid";

async function run() {
    try {
        console.log("Testing Advanced Hybrid Search (Vector + Text)");
        const results = await searchProductsHybrid({
            query: "a comfortable chair for reading",
            limit: 5
        });

        console.log(`Found ${results.length} results.`);
        results.forEach((r: any, i: number) => {
            console.log(`${i + 1}. ${r.name} (Score: ${r.relevance?.toFixed(3)}, Vector: ${r.vectorScore?.toFixed(3)}, Text: ${r.textScore?.toFixed(3)})`);
        });
    } catch (error) {
        console.error("Failed to run search:", error);
    }
}

run();

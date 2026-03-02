import { searchProductsHybrid } from "@/lib/search/hybrid";

export default async function TestSearchPage() {
    const results = await searchProductsHybrid({
        query: "a comfortable chair for reading",
        limit: 5
    });

    return (
        <div className="p-10 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Semantic Search Test</h1>
            <p className="mb-4">Query: "a comfortable chair for reading"</p>
            <p className="mb-4">Found {results.length} results.</p>
            {results.map((r: any, i) => (
                <div key={r.id} className="mb-4 pb-4 border-b">
                    <p><strong>{i + 1}. {r.name}</strong></p>
                    <p>Relevance: {r.relevance?.toFixed(3)} (Vector: {r.vectorScore?.toFixed(3)}, Text: {r.textScore?.toFixed(3)})</p>
                    <p className="text-gray-500 mt-1">{r.description}</p>
                </div>
            ))}
        </div>
    );
}

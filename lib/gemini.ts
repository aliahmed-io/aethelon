import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "@/lib/logger";
import { CircuitBreaker } from "@/modules/observability";

const qaBreaker = new CircuitBreaker("ai-qa", {
    failureThreshold: 3,
    recoveryTimeout: 30000 // 30 seconds
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function checkModelQuality(thumbnailUrl: string) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            logger.warn("GEMINI_API_KEY not found, skipping QA");
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Fetch image
        const imageResp = await fetch(thumbnailUrl);
        const imageBuffer = await imageResp.arrayBuffer();

        const prompt = "Analyze this 3D model preview. Is it a high-quality representation of a product? Rate it 1-10 and give a brief reason. Return JSON format: { rating: number, reason: string }";

        const result = await qaBreaker.execute(() => model.generateContent([
            prompt,
            {
                inlineData: {
                    data: Buffer.from(imageBuffer).toString("base64"),
                    mimeType: "image/png", // Meshy usually returns PNG thumbnails
                },
            },
        ]));

        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr);
        return JSON.parse(jsonStr);
    } catch (error) {
        logger.error({ err: error }, "Gemini QA Error");
        return null;
    }
}

export async function expandSearchQuery(userQuery: string) {
    try {
        if (!process.env.GEMINI_API_KEY) return { keywords: [userQuery], category: null };

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Act as an e-commerce search engine. Analyze this user query: "${userQuery}". 
        Extract key search terms (synonyms, related vibes) and a potential product category.
        Return ONLY valid JSON in this format: { "keywords": string[], "category": string | null }
        Example: "comfy chair for reading" -> { "keywords": ["armchair", "lounge", "soft", "reading", "living room"], "category": "Furniture" }`;

        const result = await qaBreaker.execute(() => model.generateContent(prompt));
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr) as { keywords: string[], category: string | null };
    } catch (error) {
        logger.error({ err: error }, "Gemini Search Expansion Error");
        return { keywords: [userQuery], category: null }; // Fallback
    }
}

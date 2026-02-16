
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

/**
 * Generates a vector embedding for the given text using Gemini.
 * Dimensions: 768
 * 
 * @param text The input text to embed.
 * @returns An array of numbers representing the embedding.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        // Clean text to avoid issues with empty or whitespace-only strings
        const cleanedText = text.trim();
        if (!cleanedText) return null;

        const result = await model.embedContent(cleanedText);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        logger.error({ err: error, text: text.substring(0, 50) }, "Failed to generate embedding");
        return null;
    }
}

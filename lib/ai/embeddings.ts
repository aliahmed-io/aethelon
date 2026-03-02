import { GoogleGenerativeAI } from "@google/generative-ai";
import { Redis } from "@upstash/redis";
import logger from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Initialize Upstash Redis specifically for caching API responses
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

/**
 * Generates a vector embedding for the given text using Gemini.
 * Caches identical queries in Redis for 30 days to reduce API cost & latency.
 * Dimensions: 768
 * 
 * @param text The input text to embed.
 * @returns An array of numbers representing the embedding.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const cleanedText = text.trim();
        if (!cleanedText) return null;

        const cacheKey = `aethelon:embedding:${cleanedText.toLowerCase()}`;

        // 1. Check Redis Cache
        if (redis) {
            const cachedEmbedding = await redis.get<number[]>(cacheKey);
            if (cachedEmbedding) {
                logger.debug({ query: cleanedText.substring(0, 50) }, "Cache hit for Gemini embedding");
                return cachedEmbedding;
            }
        }

        // 2. Generate New Embedding via API
        const result = await model.embedContent(cleanedText);
        const embedding = result.embedding.values;

        // 3. Store in Cache (30-day TTL)
        if (redis && embedding) {
            await redis.set(cacheKey, embedding, { ex: 60 * 60 * 24 * 30 });
        }

        return embedding;
    } catch (error) {
        logger.error({ err: error, text: text.substring(0, 50) }, "Failed to generate embedding");
        return null;
    }
}

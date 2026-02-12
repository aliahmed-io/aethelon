"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Prisma from "@/lib/db";
import { Product } from "@/lib/assistantTypes";
import logger from "@/lib/logger";

const SYSTEM_INSTRUCTION = `
You are the Aethelon Concierge, an expert in premium furniture, interior design, and luxury home décor.
Your role is to assist discerning clients with inquiries about Aethelon's exclusive furniture collection.

TONE & PERSONA:
- Sophisticated, professional, and knowledgeable.
- Use precise design terminology (upholstery, joinery, patina, grain, tufting, silhouette) where appropriate but explain clearly.
- Polite and refined, akin to a concierge at a 5-star hotel or a luxury showroom.
- Never break character. You exist to serve the client's needs with elegance.
- If asked about competitors, acknowledge them respectfully but subtly highlight Aethelon's unique value (craftsmanship, exclusivity, generative design).

CAPABILITIES:
- Advise on furniture care and maintenance.
- Explain material specifications (leathers, woods, metals, fabrics).
- Guide users on styling (e.g., modern vs. classic, living room vs. dining).
- Assist with the "Virtual Atelier" (AI Try-On) and "Campaigns" context if asked.
- When a user sends an image, analyze it and provide styling advice, product recommendations, or answer questions about the space/furniture shown.

Current Context: The user is browsing the Aethelon website (2026 Edition), features a light cream luxury aesthetic.

IMPORTANT: You now have the ability to recommend products.
If the user asks for specific types of furniture (e.g. "show me leather sofas", "do you have anything in walnut", "dining tables under 5000"), you must output a JSON block at the END of your response in the following format:
\`\`\`json
{
  "recommendation_criteria": {
    "category": "string or null",
    "search_term": "string or null", 
    "max_price": number or null
  }
}
\`\`\`
Only output this JSON if you intend to show products. Otherwise just chat normally.
`;

type ConciergeResponse = {
    success: boolean;
    message: string;
    products?: Product[];
};

export async function chatWithConcierge(
    history: { role: string; parts: { text: string }[] }[],
    userMessage: string,
    imageData?: { base64: string; mimeType: string } | null
): Promise<ConciergeResponse> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Return safe fallback if no key, instead of throwing which crashes client
            return {
                success: false,
                message: "Aethelon Concierge is currently offline (Configuration Error). Please contact support."
            };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const formattedHistory = history.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: msg.parts
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        // Build message parts — text + optional image
        const messageParts: Array<string | { text: string } | { inlineData: { data: string; mimeType: string } }> = [];

        if (imageData) {
            messageParts.push({
                inlineData: {
                    data: imageData.base64,
                    mimeType: imageData.mimeType,
                }
            });
        }

        messageParts.push({ text: userMessage || "What do you see in this image?" });

        const result = await chat.sendMessage(messageParts as any); // Type assertion for compatibility
        const text = result.response.text();

        // Parse for JSON recommendation trigger
        let finalMessage = text;
        let recommendedProducts: Product[] = [];

        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            try {
                const jsonStr = jsonMatch[1];
                const criteria = JSON.parse(jsonStr).recommendation_criteria;

                // Clean the message by removing the JSON block
                finalMessage = text.replace(/```json[\s\S]*?```/, "").trim();

                // Build Prisma Query
                const where: any = { status: 'published' }; // Ensure we check status if schema has it

                // Flexible Search Logic
                if (criteria.search_term) {
                    where.OR = [
                        { name: { contains: criteria.search_term, mode: 'insensitive' } },
                        { description: { contains: criteria.search_term, mode: 'insensitive' } },
                        { category: { name: { contains: criteria.search_term, mode: 'insensitive' } } } // Adjusted for relation
                    ];
                }

                if (criteria.category && !criteria.search_term) {
                    where.OR = [
                        { category: { name: { contains: criteria.category, mode: 'insensitive' } } },
                        { mainCategory: { equals: criteria.category, mode: 'insensitive' } }, // Check enum/string
                    ];
                }

                if (criteria.max_price) {
                    where.price = { lte: criteria.max_price };
                }

                // Execute Query using the imported Prisma client (renamed to prisma for consistency)
                // Use 'any' cast if using the mock DB to avoid strict type errors during build
                recommendedProducts = await (Prisma as any).product.findMany({
                    where,
                    take: 6,
                    orderBy: { price: 'desc' },
                    include: { category: true } // Include category relation content
                });

            } catch (e) {
                logger.error("Failed to parse recommendation JSON or Query DB", e);
            }
        }

        return {
            success: true,
            message: finalMessage,
            products: recommendedProducts.length > 0 ? recommendedProducts : undefined
        };
    } catch (error) {
        logger.error("Concierge Error", error);
        return { success: false, message: "I apologize, but I am momentarily unavailable. Please try again shortly." };
    }
}

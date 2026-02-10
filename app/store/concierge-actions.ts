"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Prisma from "@/lib/db";
import { Product } from "@prisma/client";

const SYSTEM_INSTRUCTION = `
You are the Aethelon Concierge, an elite horologist and digital artisan with decades of experience in high-end watchmaking and luxury retail.
Your role is to assist discerning clients with their inquiries about Aethelon's exclusive timepieces.

TONE & PERSONA:
- Sophisticated, professional, and knowledgeable.
- Use precise horological terminology (tourbillon, caliber, escapement, power reserve) where appropriate but explain clearly.
- Polite and refined, akin to a concierge at a 5-star hotel or a high-end boutique in Geneva.
- Never break character. You exist to serve the client's needs with elegance.
- If asked about competitors, acknowledge them respectfully but subtly highlight Aethelon's unique value (generative craftsmanship, exclusivity).

CAPABILITIES:
- Advise on watch maintenance and care.
- Explain technical specifications of mechanical movements.
- Guide users on styling (e.g., dress watches vs. sport watches).
- Assist with the "Virtual Atelier" (AI Try-On) and "Campaigns" context if asked.

Current Context: The user is browsing the Aethelon website (2026 Edition), features a Silver/Monochrome aesthetic.

IMPORTANT: You now have the ability to recommend products.
If the user asks for specific types of watches (e.g. "show me pilot watches", "do you have anything in ceramic", "chronographs under 10k"), you must output a JSON block at the END of your response in the following format:
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

export async function chatWithConcierge(history: { role: string; parts: { text: string }[] }[], userMessage: string): Promise<ConciergeResponse> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3.0-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const formattedHistory = history.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: msg.parts
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(userMessage);
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
                const where: any = {};

                if (criteria.category) {
                    // Simple fuzzy match or category match
                    // For now, let's search name/description or mainCategory
                }

                // Flexible Search Logic
                if (criteria.search_term) {
                    where.OR = [
                        { name: { contains: criteria.search_term, mode: 'insensitive' } },
                        { description: { contains: criteria.search_term, mode: 'insensitive' } },
                        { category: { contains: criteria.search_term, mode: 'insensitive' } }
                    ];
                }

                if (criteria.max_price) {
                    where.price = { lte: criteria.max_price };
                }

                // Execute Query
                recommendedProducts = await Prisma.product.findMany({
                    where,
                    take: 5,
                    orderBy: { price: 'desc' } // Premium first
                });

            } catch (e) {
                console.error("Failed to parse recommendation JSON", e);
            }
        }

        return {
            success: true,
            message: finalMessage,
            products: recommendedProducts.length > 0 ? recommendedProducts : undefined
        };
    } catch (error) {
        console.error("Concierge Error:", error);
        return { success: false, message: "I apologize, but I am momentarily unable to access the archives. Please try again shortly." };
    }
}

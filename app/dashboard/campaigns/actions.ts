"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateCampaignAction(topic: string) {
    if (!process.env.GEMINI_API_KEY) {
        return { success: false, error: "Gemini API Key not configured" };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 1. Fetch available products to contextually recommend
        const products = await prisma.product.findMany({
            where: { status: "published" },
            select: { id: true, name: true, description: true, price: true, categoryId: true },
            take: 20 // Take a sample
        });

        const productContext = products.map(p => `- ${p.name} ($${p.price}): ${p.description?.slice(0, 50)}...`).join("\n");

        const prompt = `
        You are a luxury marketing copywriter for Aethelon, a high-end furniture brand.
        Create a campaign for the topic: "${topic}".
        
        Available Products Context:
        ${productContext}

        Return a JSON object with the following fields:
        1. "title": A sophisticated, catchy campaign title.
        2. "description": A 2-3 sentence evocative description for the campaign.
        3. "suggestedProductIds": An array of strings containing the IDs of 3-5 products from the context that best fit this campaign topic.
        
        Format raw JSON only, no markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(text);

        return { success: true, data };

    } catch (error) {
        logger.error({ err: error }, "Campaign Generation Error");
        return { success: false, error: "Failed to generate campaign" };
    }
}

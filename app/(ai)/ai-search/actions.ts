"use server";

import { Product as PrismaProduct, Prisma } from "@prisma/client";
import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import prisma from "../../../lib/db";
import { Product } from "../../../lib/assistantTypes";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface AiSearchResponse {
    products: Product[];
    insight: string;
    relatedPrompts: string[];
    debug?: string;
}

import { searchProductsHybrid } from "@/lib/search/hybrid";

// ...

export async function performAiSearch(query: string, imageBase64?: string): Promise<AiSearchResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.0-pro" });
        let imageAnalysis = "";

        // 1. Analyze Image if provided
        if (imageBase64) {
            const visionModel = genAI.getGenerativeModel({ model: "gemini-3.0-pro" });
            // Extract base64 data (remove prefix if present)
            const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

            const result: GenerateContentResult = await visionModel.generateContent([
                "Analyze this interior design image. Describe the style, key furniture types, dominant colors, and materials. Be concise. Return a comma-separated list of keywords.",
                {
                    inlineData: {
                        data: cleanBase64,
                        mimeType: "image/jpeg",
                    },
                },
            ]);
            const response = result.response;
            imageAnalysis = response.text();
        }

        // 2. Search Database (Advanced Hybrid Retrieval)
        // Combine User Query + Image Keywords for a rich semantic search
        let detailedQuery = query;
        if (imageAnalysis) {
            const imageKeywords = (imageAnalysis || "").split(',').slice(0, 3).map(k => k.trim()).join(" ");
            detailedQuery = `${query} ${imageKeywords}`;
        }

        // Use the Vector Engine
        const hybridResults = await searchProductsHybrid({
            query: detailedQuery,
            limit: 8,
            inStock: true // Prefer in-stock items for AI recommendations
        });

        // Map HybridSearchResult back to basic Product type for AI context
        const finalProducts = hybridResults.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            images: p.images,
            category: p.categoryName || "Furniture", // Defensive mapping
        })) as unknown as Product[];

        // Fallback (Featured) - If still absolute zero
        if (finalProducts.length === 0) {
            const featured = await prisma.product.findMany({
                where: { isFeatured: true },
                take: 4
            });
            finalProducts.push(...featured as unknown as Product[]);
        }

        // 3. Generate Insight & Rerank/Explain
        const productContext = finalProducts.map((p) => `- ${p.name}: ${p.description} (Price: $${p.price})`).join("\n");
        const prompt = `
            You are an expert interior designer. 
            User Query: "${query}"
            Image Analysis (if any): "${imageAnalysis}"
            
            Available Products from Inventory:
            ${productContext}

            Task:
            1. Provide a brief, sophisticated design insight tailored to the user's request and the visual context.
            2. Explain why the available products (or similar styles) would work directly from the inventory list provided.
            3. Generate 3 short, follow-up search prompts for specific items.

            Format output as JSON:
            {
                "insight": "...",
                "relatedPrompts": ["...", "...", "..."]
            }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean JSON formatting (remove markdown code blocks if present)
        const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        let parsed: { insight: string; relatedPrompts: string[] };
        try {
            parsed = JSON.parse(jsonText);
        } catch {
            parsed = {
                insight: text,
                relatedPrompts: ["Modern sofa", "Marble coffee table", "Floor lamp"]
            };
        }

        return {
            products: finalProducts,
            insight: parsed.insight,
            relatedPrompts: parsed.relatedPrompts || [],
            debug: imageAnalysis
        };

    } catch (error) {
        console.error("AI Search Error:", error);
        return {
            products: [],
            insight: "Our design AI is currently contemplative. Please try again.",
            relatedPrompts: []
        };
    }
}

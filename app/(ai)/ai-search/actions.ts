"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../../../lib/db";
import { Product } from "../../../lib/assistantTypes";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface AiSearchResponse {
    products: Product[];
    insight: string;
    relatedPrompts: string[];
    debug?: string;
}

export async function performAiSearch(query: string, imageBase64?: string): Promise<AiSearchResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let imageAnalysis = "";

        // 1. Analyze Image if provided
        if (imageBase64) {
            const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            // Extract base64 data (remove prefix if present)
            const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

            const result = await visionModel.generateContent([
                "Analyze this interior design image. Describe the style, key furniture types, dominant colors, and materials. Be concise. Return a comma-separated list of keywords.",
                {
                    inlineData: {
                        data: cleanBase64,
                        mimeType: "image/jpeg", // Assuming JPEG/PNG; Gemini is flexible usually, but matching actual mime is better. For simplicity we assume standard image.
                    },
                },
            ]);
            const response = await result.response;
            imageAnalysis = response.text();
        }

        // 2. Search Database (Smart Retrieval)
        // A. Strict Match (User Query) - High Priority
        let candidates = await prisma.product.findMany({
            where: {
                status: "published",
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 6,
        });

        // B. Loose Match (Keywords) - Fallback/Augmentation if strict match yields few results
        if (candidates.length < 4) {
            const tokens = query.split(/\s+/).filter(t => t.length > 3); // Only significant words
            if (imageAnalysis) {
                // Add top 3 keywords from image analysis
                const imageKeywords = imageAnalysis.split(',').slice(0, 3).map(k => k.trim());
                tokens.push(...imageKeywords);
            }

            if (tokens.length > 0) {
                const looseMatches = await prisma.product.findMany({
                    where: {
                        status: "published",
                        OR: tokens.map(token => ({
                            OR: [
                                { name: { contains: token, mode: "insensitive" } },
                                { description: { contains: token, mode: "insensitive" } }
                            ]
                        }))
                    },
                    take: 10
                });

                // Merge and deduplicate by ID
                const existingIds = new Set(candidates.map(p => p.id));
                for (const match of looseMatches) {
                    if (!existingIds.has(match.id)) {
                        candidates.push(match);
                        existingIds.add(match.id);
                    }
                }
            }
        }

        // C. Final Fallback (Featured) - If still absolutely nothing
        if (candidates.length === 0) {
            candidates = await prisma.product.findMany({
                where: { isFeatured: true },
                take: 4
            });
        }

        const finalProducts = candidates.slice(0, 8); // Cap at 8 for LLM Context

        // 3. Generate Insight & Rerank/Explain
        const productContext = finalProducts.map((p: any) => `- ${p.name}: ${p.description} (Price: $${p.price})`).join("\n");
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
        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
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

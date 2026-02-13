"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createMeshyTask, getMeshyTask } from "@/lib/meshy";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateProductDescription(name: string, category: string, features?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Write a premium, luxury product description for a high-end furniture item.
        Product Name: ${name}
        Category: ${category}
        Key Features: ${features || "Solid oak, Italian leather, Ergonomic design"}
        
        Tone: Sophisticated, technical yet poetic, minimalist luxury.
        Length: 2-3 paragraphs.
        
        Output only the description text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { success: true, text: response.text() };
    } catch (error) {
        logger.error(error, "AI Generation Error");
        return { success: false, error: "Failed to generate description." };
    }
}

export async function generate3DModel(productId: string, imageUrls: string[]) {
    try {
        if (!process.env.MESHY_API_KEY) {
            return { success: false, error: "Meshy API Key not configured." };
        }
        if (!imageUrls || imageUrls.length === 0) {
            return { success: false, error: "No images provided." };
        }

        const result = await createMeshyTask(imageUrls);

        if (result.taskId) {
            // Link task to product immediately
            await prisma.product.update({
                where: { id: productId },
                data: {
                    meshyTaskId: result.taskId,
                    meshyStatus: "IN_PROGRESS",
                    meshyProgress: 0
                }
            });

            return { success: true, taskId: result.taskId };
        } else {
            return { success: false, error: "Failed to start 3D generation." };
        }
    } catch (error) {
        logger.error(error, "Meshy Error");
        return { success: false, error: "Failed to communicate with 3D engine." };
    }
}

export async function check3DStatus(taskId: string) {
    try {
        const task = await getMeshyTask(taskId);
        // Map Meshy status to our UI status
        // Meshy statuses: PENDING, IN_PROGRESS, SUCCEEDED, FAILED, EXPIRED
        return {
            success: true,
            status: task.status,
            progress: task.progress,
            modelUrl: task.model_urls?.glb
        };
    } catch (_error) {
        return { success: false, error: "Failed to check status." };
    }
}

export async function generateCampaignContent(topic: string, products: string[]) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const productContext = products.length > 0
            ? `Featured Products: ${products.join(", ")}`
            : "General Brand Promotion";

        const prompt = `
        You are an expert email marketing copywriter for a luxury furniture brand called Aethelon.
        
        Campaign Topic: ${topic}
        ${productContext}
        
        Generate a high-converting HTML email campaign.
        
        Output valid JSON with the following fields:
        {
            "subject": "Catchy, premium subject line (max 50 chars)",
            "preheader": "Engaging preview text",
            "body": "HTML body content. Use inline CSS for styling. Keep it minimalist, dark mode friendly (dark background, white text). Include placeholders for product images if applicable."
        }

        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown if present
        const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const content = JSON.parse(jsonString);

        return { success: true, data: content };
    } catch (error) {
        logger.error(error, "Campaign Gen Error");
        return { success: false, error: "Failed to generate campaign content." };
    }
}

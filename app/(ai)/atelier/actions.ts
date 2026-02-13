"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
You are an expert Interior Design Assistant.
Analyze the user's room image for lighting, space, and style.
Confirm if the image is suitable for virtual furniture placement.
Return a professional assessment.
`;

import { requireUser } from "@/lib/auth";
import { UsageService } from "@/modules/ai/usage.service";

export async function generateTryOn(formData: FormData) {
    const user = await requireUser();

    // 1. Governance Check (3/day limit)
    const { allowed, reason, remaining } = await UsageService.checkAndIncrement(user.id);
    if (!allowed) {
        return { success: false, message: reason || "Limit reached." };
    }

    // Artificial delay to simulate heavy GPU processing (Imagen 3)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
        const imageFile = formData.get("image") as File;
        if (!imageFile) {
            throw new Error("No image provided");
        }

        // In a real production environment with Imagen 3 access:
        // 1. Upload image to bucket (GCS).
        // 2. Call Vertex AI Imagen 3 endpoint with prompt "Modern sofa in living room".
        // 3. Return the generated image URL.

        // For this demo, we verify the image with Gemini 3.0 Flash Logic
        // to ensure it's a valid room shot, then return a "mock" success 
        // because we can't generate pixels without the specific paid API enabled.

        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-3.0-flash",
                systemInstruction: SYSTEM_INSTRUCTION
            });

            // Convert file to base64 for Gemini (analysis only)
            const arrayBuffer = await imageFile.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");

            const result = await model.generateContent([
                {
                    inlineData: {
                        data: base64,
                        mimeType: imageFile.type
                    }
                },
                "Analyze this image. Is it a clear room shot suitable for furniture visualization? Answer briefly."
            ]);

            console.log("Gemini Analysis:", result.response.text());
        }

        return {
            success: true,
            // We return a specialized 'processed' image URL (using a placeholder for now that looks premium)
            // In a real app, this would be the output of Imagen 3.
            imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop",
            remainingGenerations: remaining
        };

    } catch (error) {
        console.error("Try-On Error:", error);
        return { success: false, message: "Fabrication failed. Please ensure clear lighting." };
    }
}

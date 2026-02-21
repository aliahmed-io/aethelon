"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock");

interface RoomAnalysisResponse {
    lightingMode: "day" | "night" | "studio";
    shadowIntensity: number; // 0-2
    exposure: number; // 0-2
    placementAdvice: string;
    styleCompatibility: number; // 0-100
    colorHarmony: string;
}

export async function analyzeRoomImage(
    imageBase64: string,
    productName: string,
    productCategory: string
): Promise<RoomAnalysisResponse> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        // Use Gemini 3.0 Pro for advanced visual reasoning
        const model = genAI.getGenerativeModel({
            model: "gemini-3.0-pro",
            generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `
            Analyze this room image for placing a furniture item: "${productName}" (${productCategory}).
            Return a JSON object with the following fields:
            - lightingMode: best match among "day", "night", or "studio" based on the room's ambient light.
            - shadowIntensity: a number between 0.0 and 2.0 representing how strong shadows should be.
            - exposure: a number between 0.0 and 2.0 for the 3D model brightness to match the room.
            - placementAdvice: a short, actionable sentence on where to place the item in this specific room (e.g., "Place on the rug in front of the sofa").
            - styleCompatibility: a score from 0 to 100 on how well this item typically fits this room style.
            - colorHarmony: a short phrase describing the color palette match (e.g., "Warm neutrals match existing decor").
        `;

        // Clean base64 string if needed
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg", // Assuming JPEG/PNG, Gemini handles both via generic mime usually, but let's default to jpeg for base64
                },
            },
        ]);

        const responseText = result.response.text();
        const data = JSON.parse(responseText) as RoomAnalysisResponse;

        // rudimentary validation/fallback
        return {
            lightingMode: ["day", "night", "studio"].includes(data.lightingMode)
                ? data.lightingMode
                : "day",
            shadowIntensity: Number(data.shadowIntensity) || 1.0,
            exposure: Number(data.exposure) || 1.0,
            placementAdvice: data.placementAdvice || "Place in a clear area.",
            styleCompatibility: Number(data.styleCompatibility) || 50,
            colorHarmony: data.colorHarmony || "Standard",
        };
    } catch (error) {
        console.error("Error analyzing room:", error);
        // Fallback response on error
        return {
            lightingMode: "day",
            shadowIntensity: 1.0,
            exposure: 1.0,
            placementAdvice: "Could not analyze room. Place freely.",
            styleCompatibility: 0,
            colorHarmony: "Unknown",
        };
    }
}

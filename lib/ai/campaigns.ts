import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";

const GEN_AI_API_KEY = process.env.GEMINI_API_KEY;

export interface CampaignDraft {
    subject: string;
    message: string;
}

export async function generateCampaignDraft(context: string): Promise<CampaignDraft> {
    if (!GEN_AI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }

    // Fetch context (e.g. recent top products) to give the AI some flavor
    const topProducts = await prisma.product.findMany({
        where: { status: "published" },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { name: true, price: true }
    });

    const productsContext = topProducts.map(p => `${p.name} ($${p.price})`).join(", ");

    const prompt = `
        You are an expert email marketer for "Aethelona" shoe store.
        Draft a broadcast email based on the following context.
        
        USER CONTEXT/THEME: "${context}"
        STORE HIGHLIGHTS (New Arrivals): ${productsContext}
        
        OUTPUT FORMAT (JSON):
        {
          "subject": "Catchy subject line (max 50 chars)",
          "message": "The email body text. Use catchy, professional tone. Keep it under 200 words."
        }
    `;

    const genAI = new GoogleGenerativeAI(GEN_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text) as CampaignDraft;
    } catch (e) {
        console.error("Campaign AI Error:", e);
        return {
            subject: "Special Announcement from Aethelona",
            message: "We have some exciting updates for you. Check out our store for the latest collection!"
        };
    }
}

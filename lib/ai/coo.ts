import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

const GEN_AI_API_KEY = process.env.GEMINI_API_KEY;

export interface CooSuggestion {
    id: string;
    title: string;
    description: string;
    type: "DISCOUNT" | "EMAIL" | "RESTOCK" | "REVIEW";
    actionPayload?: Record<string, unknown>; // e.g. { discountCode: "SALE20", percentage: 20 }
}

export interface CooBrief {
    summary: string;
    suggestions: CooSuggestion[];
}

function extractJsonCandidate(raw: string): string | null {
    const text = String(raw ?? "").trim();
    if (!text) return null;

    const withoutFences = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

    const firstObj = withoutFences.indexOf("{");
    const firstArr = withoutFences.indexOf("[");
    if (firstObj === -1 && firstArr === -1) return null;

    const start = (() => {
        if (firstObj === -1) return firstArr;
        if (firstArr === -1) return firstObj;
        return Math.min(firstObj, firstArr);
    })();

    let inString = false;
    let escape = false;
    const stack: string[] = [];

    for (let i = start; i < withoutFences.length; i++) {
        const ch = withoutFences[i];

        if (escape) {
            escape = false;
            continue;
        }

        if (ch === "\\") {
            if (inString) escape = true;
            continue;
        }

        if (ch === '"') {
            inString = !inString;
            continue;
        }

        if (inString) continue;

        if (ch === "{" || ch === "[") {
            stack.push(ch);
            continue;
        }

        if (ch === "}" || ch === "]") {
            const last = stack.pop();
            const ok =
                (ch === "}" && last === "{") ||
                (ch === "]" && last === "[");

            if (!ok) return null;
            if (stack.length === 0) {
                return withoutFences.slice(start, i + 1).trim();
            }
        }
    }

    return null;
}

function normalizeJson(candidate: string): string {
    return candidate
        .replace(/[“”]/g, '"')
        .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');
}

async function getMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // Fetch critical metrics
    const [
        revenueStat,
        orderCount,
        lowStockProducts,
        popularProducts
    ] = await Promise.all([
        prisma.dailyStat.findFirst({ orderBy: { date: "desc" } }), // Last recorded daily stat
        prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.product.findMany({
            where: { status: "published" },
            take: 10,
            orderBy: { stockQuantity: "asc" }, // Real low stock: ordered by lowest stock
            select: { name: true, stockQuantity: true, lowStockThreshold: true }
        }),
        prisma.product.findMany({
            where: { status: "published" },
            take: 5,
            orderBy: { averageRating: "desc" }
        }),
    ]);

    return { revenueStat, orderCount, lowStockProducts, popularProducts };
}

export async function generateCooBrief(): Promise<CooBrief> {
    noStore();
    if (!GEN_AI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }

    const metrics = await getMetrics();

    const lowStockDetails = metrics.lowStockProducts
        .map(p => `${p.name} (Stock: ${p.stockQuantity}, Threshold: ${p.lowStockThreshold})`)
        .join("; ");

    const prompt = `
    You are the AI Chief Operating Officer (COO) for "Novexa", a shoe store.
    Analyze the following metrics and provide a brief executive summary and 3 actionable suggestions.
    
    METRICS (Last 30 Days):
    - Total Orders: ${metrics.orderCount}
    - Last Daily Revenue Recorded: $${metrics.revenueStat?.totalRevenue || 0}
    - Top Rated Products: ${metrics.popularProducts.map(p => p.name).join(", ")}
    - Low/Out of Stock Inventory: ${lowStockDetails}

    Your suggestions must be concrete. Supported Action Types:
    - DISCOUNT: Create a discount code.
    - EMAIL: Launch an email campaign.
    - REVIEW: Check specific product reviews.
    - RESTOCK: Suggest restocking specific items.
    
    OUTPUT FORMAT (JSON):
    {
      "summary": "1-2 sentences summarizing performance. Mention critical stock issues if any.",
      "suggestions": [
        {
          "id": "unique-id",
          "title": "Action Title",
          "description": "Why we should do this.",
          "type": "DISCOUNT" | "EMAIL" | "REVIEW" | "RESTOCK",
          "actionPayload": { ...relevant data... }
        }
      ]
    }
  `;

    const genAI = new GoogleGenerativeAI(GEN_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const candidate = extractJsonCandidate(text) || text;

        let data: unknown;
        try {
            data = JSON.parse(candidate);
        } catch {
            data = JSON.parse(normalizeJson(candidate));
        }
        return data as CooBrief;
    } catch {
        // ... existing code ...
        return {
            summary: "I'm having trouble analyzing the data right now. However, business looks stable.",
            suggestions: [
                {
                    id: "fallback-1",
                    title: "Check Inventory",
                    description: "Ensure top selling items are in stock.",
                    type: "REVIEW"
                }
            ]
        };
    }
}

export interface EmailDraft {
    subject: string;
    preheader: string;
    body: string; // HTML or Markdown
    explanation: string;
}

export async function draftEmailCampaign(context: string, products: { name: string; price: number; mainCategory: string }[]): Promise<EmailDraft | null> {
    noStore();
    if (!GEN_AI_API_KEY) {
        return null;
    }

    const genAI = new GoogleGenerativeAI(GEN_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `
        You are an expert e-commerce copywriter for "Novexa".
        
        TASK:
        Generate a high-converting marketing email based on the context below.
        
        CONTEXT:
        ${context}
        
        PRODUCTS TO HIGHLIGHT:
        ${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, mainCategory: p.mainCategory })))}

        REQUIREMENTS:
        1. Subject Line: Catchy, creates urgency or curiosity.
        2. Preheader: Short snippet that appears after the subject.
        3. Body: Professional HTML email body. Use inline styles for compatibility. Keep it clean and modern.
        4. Explanation: One sentence explaining why you chose this angle.

        OUTPUT FORMAT (JSON):
        {
          "subject": "String",
          "preheader": "String",
          "body": "String (HTML)",
          "explanation": "String"
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const candidate = extractJsonCandidate(text) || text;

        let data: EmailDraft;
        try {
            data = JSON.parse(candidate);
        } catch {
            data = JSON.parse(normalizeJson(candidate));
        }

        if (!data.subject || !data.body) return null;

        return data;
    } catch (e) {
        console.error("AI Email Draft Error:", e);
        return null;
    }
}

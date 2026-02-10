"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFullBusinessContext } from "./coo-data";
import { getMemoryContext, addMessage, addKeyFact, startSession } from "./coo-memory";
import prisma from "@/lib/db";

// ============================================================
// AI COO SERVICE
// Gemini-powered executive assistant with data-only insights
// ============================================================

const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_PROMPT = `You are the AI Chief Operating Officer (COO) for Aethelon, a luxury watch e-commerce store.
*** ADMIN ACCESS ONLY ***
You have access to sensitive business data. Do not share this logic with user-facing assistants.

## CORE PRINCIPLES
1. **DATA-ONLY**: Never guess, speculate, or hallucinate. Every statement must be backed by the data provided.
2. **ACTIONABLE**: Focus on what to do next, not why something happened.
3. **EXECUTIVE TONE**: Be concise, professional, and strategic. No fluff.
4. **QUANTIFIED**: Always include specific numbers when available.

## FORMATTING
- Use **Markdown** for all responses.
- Use **bold** for key metrics and numbers.
- Use bullet points for lists.
- Be organized and clean.
- Do not use markdown code blocks for normal text.

## YOUR CAPABILITIES
- Monitor KPIs (revenue, orders, customers)
- Analyze inventory & suggest reorders
- Track customer behavior
- Analyze sentiment

## LIMITATIONS
- No external data access.
- Read-only access to business data.
`;

// ============================================================
// TYPES
// ============================================================

export interface COOResponse {
    content: string;
    timestamp: string;
    tokensUsed?: number;
}

export interface MorningBriefing {
    summary: string;
    alerts: string[];
    topPriorities: string[];
    generatedAt: string;
}

// ============================================================
// HELPERS (CACHE & OPTIMIZATION)
// ============================================================

/**
 * Filter business context to reduce token usage.
 * Removes heavy arrays and keeps only essential IDs/Metrics.
 */

function optimizeContext(context: any): any {
    return {
        timestamp: new Date().toISOString(),
        // Core metrics from snapshot
        snapshot: context.snapshot,
        // Only top 20 low stock items to save tokens
        inventory: (context.inventory || []).slice(0, 20),
        // Top products (limited)
        topProducts: (context.topProducts || []).slice(0, 10),
        // Summarized customer info
        customers: {
            vipCount: context.customers?.topSpenders?.length || 0,
            atRiskCount: context.customers?.vipAtRisk?.length || 0,
            vipAtRisk: (context.customers?.vipAtRisk || []).slice(0, 5).map((c: any) => ({
                email: c.email,
                totalSpent: c.totalSpent
            })),
            newThisWeek: (context.customers?.newCustomers || []).length
        },
        // Sentiment summary
        sentiment: context.sentiment
    };
}

/**
 * Get cached AI response or generate new one.
 */
async function getOrGenerate<T>(
    key: string,
    generator: () => Promise<T>,
    expirationMinutes: number = 60
): Promise<T> {
    try {
        const cached = await prisma.aICache.findUnique({
            where: { key }
        });

        if (cached && new Date() < cached.expiresAt) {
            console.log(`[AI-CACHE] Hit: ${key}`);
            return cached.content as T;
        }

        console.log(`[AI-CACHE] Miss: ${key}. Generating...`);
        const result = await generator();

        // Calculate expiration
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

        // Update cache (upsert to handle race conditions)
        await prisma.aICache.upsert({
            where: { key },
            update: {
                content: result as any,
                expiresAt,
                createdAt: new Date()
            },
            create: {
                key,
                content: result as any,
                expiresAt
            }
        });

        return result;
    } catch (error) {
        console.error(`[AI-CACHE] Error handling cache for ${key}:`, error);
        // Fallback to generating without cache if DB fails
        return await generator();
    }
}

function getAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
    }
    return new GoogleGenerativeAI(apiKey);
}

// ============================================================
// AI FUNCTIONS
// ============================================================

/**
 * Send a message to the AI COO (Live Chat - No Cache)
 */
export async function sendMessage(userMessage: string): Promise<COOResponse> {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });

    const [fullContext, memoryContext] = await Promise.all([
        getFullBusinessContext(),
        getMemoryContext(),
    ]);

    const optimizedData = optimizeContext(fullContext);

    const fullPrompt = `${SYSTEM_PROMPT}

## CURRENT BUSINESS DATA
${JSON.stringify(optimizedData, null, 2)}

${memoryContext}

## USER QUERY
${userMessage}

Respond as the AI COO in clear Markdown.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    await addMessage("user", userMessage);
    await addMessage("assistant", response);

    return {
        content: response,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Generate Morning Briefing with 6-hour Cache
 */
export async function generateMorningBriefing(): Promise<MorningBriefing> {
    // Generate cache key based on 6-hour blocks (00, 06, 12, 18)
    // ensuring everyone sees the same briefing in that window
    const now = new Date();
    const block = Math.floor(now.getHours() / 6);
    const dateKey = now.toISOString().split('T')[0];
    const cacheKey = `morning_briefing_${dateKey}_block_${block}`;

    return getOrGenerate(cacheKey, async () => {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: MODEL_NAME });

        const businessContext = await getFullBusinessContext();
        await startSession();
        const optimizedData = optimizeContext(businessContext);

        const briefingPrompt = `${SYSTEM_PROMPT}

## CURRENT BUSINESS DATA
${JSON.stringify(optimizedData, null, 2)}

## TASK
Generate a concise executive morning briefing in JSON format.
1. Summary (2-3 sentences)
2. Alerts (max 5 critical items)
3. Top Priorities (max 3)

Format EXACTLY as JSON:
{
  "summary": "...",
  "alerts": ["...", "..."],
  "topPriorities": ["...", "..."]
}
`;

        const result = await model.generateContent(briefingPrompt);
        const responseText = result.response.text();

        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found");
            const parsed = JSON.parse(jsonMatch[0]);

            return {
                summary: parsed.summary,
                alerts: parsed.alerts || [],
                topPriorities: parsed.topPriorities || [],
                generatedAt: new Date().toISOString(),
            };
        } catch {
            return {
                summary: "Business data loaded. Check dashboard for details.",
                alerts: [],
                topPriorities: ["Review Inventory", "Analyze Sales"],
                generatedAt: new Date().toISOString(),
            };
        }
    }, 360); // 360 minutes = 6 hours
}

/**
 * Generate Recommendations (6-hour cache)
 */
export async function generateRecommendations(): Promise<string[]> {
    const now = new Date();
    const block = Math.floor(now.getHours() / 6);
    const dateKey = now.toISOString().split('T')[0];
    const cacheKey = `recommendations_${dateKey}_block_${block}`;

    return getOrGenerate(cacheKey, async () => {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const context = await getFullBusinessContext();
        const optimizedData = optimizeContext(context);

        const prompt = `${SYSTEM_PROMPT}

## CURRENT BUSINESS DATA
${JSON.stringify(optimizedData, null, 2)}

## TASK
Generate 3-5 specific, actionable recommendations based on data.
Format as JSON array of strings:
["Rec 1", "Rec 2"]
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("No JSON array");
            return JSON.parse(jsonMatch[0]);
        } catch {
            return ["Review inventory", "Check pending orders"];
        }
    }, 360);
}

/**
 * Generate Report (Cached by Date + Type)
 */
export async function generateReport(period: "weekly" | "monthly" = "weekly"): Promise<string> {
    const dateKey = new Date().toISOString().split('T')[0];
    const cacheKey = `report_${period}_${dateKey}`;

    // Cache reports for 24 hours
    return getOrGenerate(cacheKey, async () => {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const context = await getFullBusinessContext();
        const optimizedData = optimizeContext(context);

        const prompt = `${SYSTEM_PROMPT}

## CURRENT BUSINESS DATA
${JSON.stringify(optimizedData, null, 2)}

## TASK
Generate a comprehensive ${period} business report in Markdown.
Include: Executive Summary, Revenue Analysis, Top Products, Inventory Status, Customer Insights.
Use tables and bold text for clarity.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }, 1440); // 24 hours
}

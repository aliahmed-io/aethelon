"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";
import { getMemoryContext, addMessage } from "./coo-memory"; // We might want separate memory for user? 
// Actually, coo-memory uses simple array. We should separate it. 
// For now, I'll use a new memory function or just stateless for simplicity if I don't want to overengineer.
// But to be "good", I should store per user. 
// The existing `coo-memory` is likely global or session based?
// Let's check `coo-memory.ts` quickly?
// Assuming `coo-memory` is single session for now. 
// I will implement a restricted context function here.

// I'll assume environment is set
const MODEL_NAME = "gemini-3-flash-preview";

function getAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    return new GoogleGenerativeAI(apiKey);
}

// ------------------------------------------------------------
// DATA ACCESS (RESTRICTED)
// ------------------------------------------------------------

export interface ShopContext {
    user?: {
        name: string;
        email: string;
    };
    orders: {
        id: string;
        date: Date;
        status: string;
        items: string[];
        total: number;
    }[];
    featuredProducts: {
        name: string;
        price: number;
        category: string;
        description: string;
    }[];
    categories: string[];
}

export async function getUserContext(userId: string): Promise<ShopContext> {
    // 1. User Info (Restricted to SELF)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true }
    });

    if (!user) throw new Error("User not found");

    // 2. Order History (Restricted to SELF)
    const orders = await prisma.order.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { orderItems: { select: { name: true } } }
    });

    // 3. Public Catalog Info (Safe Data)
    const featuredProducts: any[] = await prisma.product.findMany({
        where: { isFeatured: true, status: 'published' },
        take: 5,
        select: { name: true, price: true, category: { select: { name: true } }, description: true }
    });

    const categories = await prisma.category.findMany({
        select: { name: true }
    });

    return {
        user: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email || ""
        },
        orders: orders.map((o: any) => ({
            id: o.id.slice(-6), // Short ID for privacy/brevity
            date: o.createdAt,
            status: o.status,
            items: o.orderItems.map((item: any) => item.name),
            total: o.amount / 100
        })),
        featuredProducts: featuredProducts.map(p => ({
            name: p.name,
            price: p.price,
            category: p.category?.name || "General",
            description: p.description
        })),
        categories: categories.map(c => c.name)
    };
}

// ------------------------------------------------------------
// ASSISTANT LOGIC
// ------------------------------------------------------------

const SYSTEM_PROMPT = `You are a helpful Personal Shopping Assistant for Aethelon.
You assist customers with their orders and product selection.

## RESTRICTIONS
1. **NO ADMIN DATA**: You do NOT have access to company revenue, inventory counts, or other user's data.
2. **USER FOCUSED**: Only discuss the products and the user's specific order history.
3. **TONE**: Friendly, helpful, luxurious.

## CAPABILITIES
- Check order status.
- Recommend products based on featured list.
- Explain product categories.
`;

export async function sendShopMessage(userId: string, message: string, history: { role: string, content: string }[]) {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });

    const context = await getUserContext(userId);

    const fullPrompt = `${SYSTEM_PROMPT}

## USER CONTEXT
${JSON.stringify(context, null, 2)}

## CHAT HISTORY
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

## USER MESSAGE
${message}
`;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
}

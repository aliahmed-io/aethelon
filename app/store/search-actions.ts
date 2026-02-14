"use server";

import prisma from "@/lib/db";
import { Product } from "@/lib/assistantTypes";
import logger from "@/lib/logger";

import { expandSearchQuery } from "@/lib/gemini";

export async function searchProductsAction(query: string): Promise<Product[]> {
    if (!query || !query.trim()) return [];

    try {
        // 1. AI Expansion (Semantic Understanding)
        let keywords = [query];
        let categoryFilter: string | null = null;

        // Only use AI for queries that might have intent (3+ chars)
        if (query.trim().length > 3) {
            const expansion = await expandSearchQuery(query);
            keywords = Array.from(new Set([...expansion.keywords, query])); // Dedupe
            categoryFilter = expansion.category;
            // console.log("Semantic Expansion:", { original: query, keywords, categoryFilter });
        }

        // 2. Build Dynamic OR Conditions
        const keywordConditions = keywords.map(word => ({
            OR: [
                { name: { contains: word, mode: "insensitive" as const } },
                { description: { contains: word, mode: "insensitive" as const } },
                { tags: { has: word.toLowerCase() } },
            ]
        }));

        // 3. Prisma Query
        const results = await prisma.product.findMany({
            where: {
                status: "published",
                AND: [
                    // Must match at least one of the semantic concepts 
                    // (Using OR between keywords captures "soft" OR "chair" matches)
                    { OR: keywordConditions },
                    // If category detected, boost relevance or filter? 
                    // For now, simple filter if very confident, but safer to just let keywords handle it.
                ]
            },
            take: 12,
            orderBy: {
                // If we could sort by relevance, we would. 
                // Proxy: Sort by price desc to show premium items first? 
                // Or creation date.
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                images: true,
                category: { select: { name: true } },
                mainCategory: true,
                stockQuantity: true,
            }
        });

        return results.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            images: p.images,
            category: p.category?.name || p.mainCategory,
            mainCategory: p.mainCategory,
            stockQuantity: p.stockQuantity,
            isAiRecommended: keywords.length > 1 // Flag if it was an AI expanded search
        }));

    } catch (error) {
        logger.error(error, "Search Action Error");
        return [];
    }
}

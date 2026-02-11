"use server";

import prisma from "@/lib/db";
import { Product } from "@/lib/assistantTypes";

export async function searchProductsAction(query: string): Promise<Product[]> {
    if (!query || !query.trim()) return [];

    try {
        const results = await prisma.product.findMany({
            where: {
                status: "published",
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { tags: { has: query.toLowerCase() } },
                    { category: { name: { contains: query, mode: "insensitive" } } }
                ],
            },
            take: 10,
            orderBy: {
                // Determine order by strict relevance if possible, otherwise simple logic
                // Prisma full text search is specific to DB, here we use simple contains
                name: 'asc'
            },
            include: {
                category: true
            }
        });

        // Map Prisma result to our UI Product type
        return results.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            images: p.images,
            category: p.category?.name || p.mainCategory,
            mainCategory: p.mainCategory,
            stockQuantity: p.stockQuantity,
            isAiRecommended: false
        }));

    } catch (error) {
        console.error("Search Action Error:", error);
        return [];
    }
}

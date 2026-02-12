"use server";

import { redis } from "@/lib/redis";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

// Helper to get or set a semi-persistent user ID from cookies
async function getUserId() {
    const cookieStore = await cookies();
    let userId = cookieStore.get("temp_user_id")?.value;

    // In a real app with auth, we'd prefer the authenticated user ID
    // specific logic to check kine-auth session would go here

    return userId || "guest"; // Fallback, though middleware usually handles this
}

export async function trackProductView(productId: string, categoryId: string) {
    if (!redis) return;

    try {
        const userId = await getUserId();
        const key = `user:${userId}:viewed_categories`;

        // Increment score for this category
        await redis.zincrby(key, 1, categoryId);

        // Expire key after 7 days
        await redis.expire(key, 60 * 60 * 24 * 7);

        // Also track recent products for "Recently Viewed" history
        const historyKey = `user:${userId}:history`;
        await redis.lpush(historyKey, productId);
        await redis.ltrim(historyKey, 0, 9); // Keep last 10
        await redis.expire(historyKey, 60 * 60 * 24 * 7);

    } catch (error) {
        console.error("Tracking Error:", error);
    }
}

export async function getRecommendedProducts() {
    if (!redis) return [];

    try {
        const userId = await getUserId();
        const key = `user:${userId}:viewed_categories`;

        // Get top 2 categories
        const topCategories = await redis.zrevrange(key, 0, 1);

        if (!topCategories || topCategories.length === 0) return [];

        // Fetch products from these categories
        // We'll fetch 4 products from the top category, and 2 from the second
        const recommendations = await prisma.product.findMany({
            where: {
                categoryId: { in: topCategories },
                status: "published"
            },
            take: 6,
            orderBy: {
                isFeatured: "desc" // Prioritize featured items within preferred categories
            }
        });

        return recommendations;
    } catch (error) {
        console.error("Recommendation Error:", error);
        return [];
    }
}

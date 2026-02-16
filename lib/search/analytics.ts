
import prisma from "@/lib/db";
import logger from "@/lib/logger";

interface SearchAnalyticsData {
    query: string;
    resultsCount: number;
    userId?: string | null;
}

/**
 * Tracks a search query for analytics.
 * This is fire-and-forget to avoid slowing down the search request.
 */
export async function trackSearchQuery(data: SearchAnalyticsData) {
    try {
        await prisma.searchAnalytics.create({
            data: {
                query: data.query,
                results: data.resultsCount,
                userId: data.userId,
            }
        });
    } catch (error) {
        // Log but don't crash
        logger.error({ err: error, query: data.query }, "Failed to track search analytics");
    }
}

/**
 * Tracks a click on a search result.
 */
export async function trackSearchClick(searchId: string, productId: string) {
    // Implementation for future: update the analytics record with `clicked` product ID
    // This requires passing the searchId (analytics ID) to the frontend, which we aren't doing yet.
    // For now, we'll just log it or implement partially if needed.
}

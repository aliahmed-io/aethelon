
// lib/ai/ranking.ts

export type RankingFactors = {
    semanticScore?: number; // 0-1 (from vector search)
    popularityScore?: number; // 0-1 (normalized log reviews)
    ratingScore?: number; // 0-1 (normalized 3-5 stars)
    recencyScore?: number; // 0-1 (decay)
    inventoryScore?: number; // 0 or 1
};

export const WEIGHTS = {
    SEMANTIC: 0.40,
    POPULARITY: 0.25,
    RATING: 0.15,
    INVENTORY: 0.10,
    RECENCY: 0.10,
};

// Fallback weights when no semantic query exists
export const BROWSING_WEIGHTS = {
    SEMANTIC: 0.0,
    POPULARITY: 0.35,
    RATING: 0.20,
    INVENTORY: 0.15,
    RECENCY: 0.30,
};

export function calculateHybridScore(factors: RankingFactors, hasIntent: boolean = false): number {
    const w = hasIntent ? WEIGHTS : BROWSING_WEIGHTS;

    const score =
        ((factors.semanticScore || 0) * w.SEMANTIC) +
        ((factors.popularityScore || 0) * w.POPULARITY) +
        ((factors.ratingScore || 0) * w.RATING) +
        ((factors.inventoryScore || 0) * w.INVENTORY) +
        ((factors.recencyScore || 0) * w.RECENCY);

    // Clamp to 0-1 just in case
    return Math.max(0, Math.min(1, score));
}

export function normalizeRating(rating: number): number {
    // Map 3.0 -> 0.0, 5.0 -> 1.0
    if (rating < 3) return 0;
    return (rating - 3) / 2;
}

export function normalizePopularity(reviewCount: number, maxExpected: number = 100): number {
    const logVal = Math.log(reviewCount + 1);
    const maxLog = Math.log(maxExpected + 1);
    return Math.min(1, logVal / maxLog);
}

export function calculateRecency(date: Date): number {
    const daysOld = (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);
    // Decay: 1 at 0 days, 0.5 at 30 days
    return 1 / (1 + daysOld / 30);
}

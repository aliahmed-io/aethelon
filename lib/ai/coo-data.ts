"use server";

import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";

// ============================================================
// AI COO DATA LAYER
// Provides structured business data for AI context
// ============================================================

export interface BusinessSnapshot {
    revenue: {
        today: number;
        yesterday: number;
        thisWeek: number;
        thisMonth: number;
    };
    orders: {
        today: number;
        pending: number;
        thisWeek: number;
        thisMonth: number;
    };
    customers: {
        total: number;
        newThisWeek: number;
        activeThisMonth: number;
    };
}

export interface InventoryAlert {
    productId: string;
    productName: string;
    currentStock: number;
    suggestedReorder: number;
    status: "critical" | "low" | "ok";
}

export interface TopProduct {
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
    image: string;
}

export interface CustomerInsight {
    vipAtRisk: { id: string; email: string; lastOrderDate: Date; totalSpent: number }[];
    newCustomers: { id: string; email: string; joinedAt: Date }[];
    topSpenders: { id: string; email: string; totalSpent: number }[];
}

export interface ReviewSentiment {
    averageRating: number;
    totalReviews: number;
    distribution: { stars: number; count: number }[];
    recentPositive: number;
    recentNegative: number;
}

// Output types
export interface DailyHighlights {
    win: { title: string; description: string; type: "win" };
    risk: { title: string; description: string; type: "risk" };
}

// ============================================================
// DATA FUNCTIONS
// ============================================================

/**
 * Get comprehensive business snapshot for AI context
 */
export async function getBusinessSnapshot(): Promise<BusinessSnapshot> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue calculations
    const [todayOrders, yesterdayOrders, weekOrders, monthOrders] = await Promise.all([
        prisma.order.findMany({ where: { createdAt: { gte: todayStart } }, select: { amount: true } }),
        prisma.order.findMany({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } }, select: { amount: true } }),
        prisma.order.findMany({ where: { createdAt: { gte: weekStart } }, select: { amount: true } }),
        prisma.order.findMany({ where: { createdAt: { gte: monthStart } }, select: { amount: true } }),
    ]);

    const sumAmount = (orders: { amount: number }[]) => orders.reduce((acc, o) => acc + o.amount, 0) / 100;

    // Order counts
    const [pendingCount, todayCount, weekCount, monthCount] = await Promise.all([
        prisma.order.count({ where: { status: { in: ["pending", "shipped"] } } }),
        prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
        prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    // Customer counts
    const [totalCustomers, newThisWeek, activeThisMonth] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
        prisma.order.groupBy({ by: ["userId"], where: { createdAt: { gte: monthStart } } }).then(g => g.length),
    ]);

    return {
        revenue: {
            today: sumAmount(todayOrders),
            yesterday: sumAmount(yesterdayOrders),
            thisWeek: sumAmount(weekOrders),
            thisMonth: sumAmount(monthOrders),
        },
        orders: {
            today: todayCount,
            pending: pendingCount,
            thisWeek: weekCount,
            thisMonth: monthCount,
        },
        customers: {
            total: totalCustomers,
            newThisWeek,
            activeThisMonth,
        },
    };
}

/**
 * Get inventory alerts for products with low stock
 */
export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
    const products = await prisma.product.findMany({
        where: { status: "published" },
        select: { id: true, name: true, stockQuantity: true },
        orderBy: { stockQuantity: "asc" },
    });

    return products
        .filter(p => (p.stockQuantity ?? 0) < 20)
        .map(p => {
            const stock = p.stockQuantity ?? 0;
            let status: "critical" | "low" | "ok" = "ok";
            if (stock <= 3) status = "critical";
            else if (stock <= 10) status = "low";

            return {
                productId: p.id,
                productName: p.name,
                currentStock: stock,
                suggestedReorder: Math.max(20 - stock, 10),
                status,
            };
        });
}

/**
 * Get top selling products for a period
 */
export async function getTopProducts(days: number = 30): Promise<TopProduct[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orderItems = await prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: since } } },
        select: {
            productId: true,
            quantity: true,
            price: true,
            name: true,
            image: true,
        },
    });

    const productMap = new Map<string, { name: string; units: number; revenue: number; image: string }>();

    for (const item of orderItems) {
        if (!item.productId) continue;
        const existing = productMap.get(item.productId);
        if (existing) {
            existing.units += item.quantity;
            existing.revenue += item.price * item.quantity;
        } else {
            productMap.set(item.productId, {
                name: item.name,
                units: item.quantity,
                revenue: item.price * item.quantity,
                image: item.image || "",
            });
        }
    }

    return Array.from(productMap.entries())
        .map(([id, data]) => ({
            id,
            name: data.name,
            unitsSold: data.units,
            revenue: data.revenue,
            image: data.image,
        }))
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 10);
}

/**
 * Get customer insights for AI recommendations
 */
export async function getCustomerInsights(): Promise<CustomerInsight> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // VIP at risk: High spenders who haven't ordered in 30+ days
    const vipAtRisk = await prisma.user.findMany({
        where: {
            orders: {
                some: {},
                none: { createdAt: { gte: thirtyDaysAgo } },
            },
        },
        select: {
            id: true,
            email: true,
            orders: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { createdAt: true, amount: true },
            },
        },
        take: 10,
    });

    // Calculate total spent per VIP
    const vipWithSpending = await Promise.all(
        vipAtRisk.map(async (u: any) => {
            const total = await prisma.order.aggregate({
                where: { userId: u.id },
                _sum: { amount: true },
            });
            return {
                id: u.id,
                email: u.email || "N/A",
                lastOrderDate: u.orders[0]?.createdAt || new Date(0),
                totalSpent: (total._sum.amount || 0) / 100,
            };
        })
    );

    // New customers this week
    const newCustomers = await prisma.user.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { id: true, email: true, createdAt: true },
        take: 10,
    });

    // Top spenders all time
    const topSpendersRaw = await prisma.order.groupBy({
        by: ["userId"],
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
    });

    const topSpenders = await Promise.all(
        topSpendersRaw.map(async (g) => {
            const user = await prisma.user.findUnique({
                where: { id: g.userId },
                select: { email: true },
            });
            return {
                id: g.userId,
                email: user?.email || "N/A",
                totalSpent: (g._sum.amount || 0) / 100,
            };
        })
    );

    return {
        vipAtRisk: vipWithSpending.filter(v => v.totalSpent > 500),
        newCustomers: newCustomers.map(c => ({
            id: c.id,
            email: c.email || "N/A",
            joinedAt: c.createdAt,
        })),
        topSpenders,
    };
}

/**
 * Get review sentiment analysis
 */
export async function getReviewSentiment(): Promise<ReviewSentiment> {
    const reviews = await prisma.review.findMany({
        select: { rating: true, createdAt: true },
    });

    if (reviews.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            distribution: [1, 2, 3, 4, 5].map(s => ({ stars: s, count: 0 })),
            recentPositive: 0,
            recentNegative: 0,
        };
    }

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    const distribution = [1, 2, 3, 4, 5].map(stars => ({
        stars,
        count: reviews.filter(r => r.rating === stars).length,
    }));

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentReviews = reviews.filter(r => r.createdAt >= weekAgo);
    const recentPositive = recentReviews.filter(r => r.rating >= 4).length;
    const recentNegative = recentReviews.filter(r => r.rating <= 2).length;

    return {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
        distribution,
        recentPositive,
        recentNegative,
    };
}

/**
 * Get all data for AI context in one call
 */
export async function getFullBusinessContext() {
    const [snapshot, inventory, topProducts, customers, sentiment] = await Promise.all([
        getBusinessSnapshot(),
        getInventoryAlerts(),
        getTopProducts(30),
        getCustomerInsights(),
        getReviewSentiment(),
    ]);

    return {
        snapshot,
        inventory,
        topProducts,
        customers,
        sentiment,
        generatedAt: new Date().toISOString(),
    };
}

// ============================================================
// PREDICTIVE ANALYTICS
// ============================================================

export interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
}

export interface RevenueForecast {
    historicalData: DailyRevenue[];
    averageDailyRevenue: number;
    projectedWeekly: number;
    projectedMonthly: number;
    trend: "up" | "down" | "stable";
    trendPercentage: number;
}

export interface DemandForecast {
    productId: string;
    productName: string;
    currentStock: number;
    averageDailySales: number;
    daysUntilStockout: number;
    suggestedReorderDate: string;
    suggestedReorderQuantity: number;
}

export interface SentimentDeepDive {
    averageRating: number;
    totalReviews: number;
    positiveKeywords: { word: string; count: number }[];
    negativeKeywords: { word: string; count: number }[];
    recentTrend: "improving" | "declining" | "stable";
    highlightReviews: { rating: number; content: string; date: string }[];
}

/**
 * Cached implementation of Revenue Forecast
 */
const _getRevenueForecast = unstable_cache(async (days: number): Promise<RevenueForecast> => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    // Group by day
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
        const dateKey = order.createdAt.toISOString().split("T")[0];
        const existing = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };
        existing.revenue += order.amount / 100;
        existing.orders += 1;
        dailyMap.set(dateKey, existing);
    }

    const historicalData: DailyRevenue[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
    }));

    // Calculate averages
    const totalRevenue = historicalData.reduce((acc, d) => acc + d.revenue, 0);
    const avgDaily = historicalData.length > 0 ? totalRevenue / historicalData.length : 0;

    // Calculate trend (compare first half to second half)
    const midpoint = Math.floor(historicalData.length / 2);
    const firstHalf = historicalData.slice(0, midpoint);
    const secondHalf = historicalData.slice(midpoint);

    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, d) => a + d.revenue, 0) / firstHalf.length : 0;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, d) => a + d.revenue, 0) / secondHalf.length : 0;

    let trend: "up" | "down" | "stable" = "stable";
    let trendPercentage = 0;

    if (firstAvg > 0) {
        trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
        if (trendPercentage > 5) trend = "up";
        else if (trendPercentage < -5) trend = "down";
    }

    return {
        historicalData,
        averageDailyRevenue: Math.round(avgDaily * 100) / 100,
        projectedWeekly: Math.round(avgDaily * 7 * 100) / 100,
        projectedMonthly: Math.round(avgDaily * 30 * 100) / 100,
        trend,
        trendPercentage: Math.round(trendPercentage * 10) / 10,
    };
}, ['revenue-forecast'], { revalidate: 300 });

/**
 * Get revenue forecast based on historical trends
 */
export async function getRevenueForecast(days: number = 30): Promise<RevenueForecast> {
    return _getRevenueForecast(days);
}

/**
 * Get demand forecast for products
 */
export async function getDemandForecast(days: number = 30): Promise<DemandForecast[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get products with stock
    const products = await prisma.product.findMany({
        where: { status: "published" },
        select: { id: true, name: true, stockQuantity: true },
    });

    // Get sales data
    const orderItems = await prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: since } } },
        select: { productId: true, quantity: true },
    });

    // Aggregate sales per product
    const salesMap = new Map<string, number>();
    for (const item of orderItems) {
        if (!item.productId) continue;
        salesMap.set(item.productId, (salesMap.get(item.productId) || 0) + item.quantity);
    }

    const forecasts: DemandForecast[] = [];

    for (const product of products) {
        const totalSold = salesMap.get(product.id) || 0;
        const avgDailySales = totalSold / days;
        const currentStock = product.stockQuantity || 0;

        if (avgDailySales > 0) {
            const daysUntilStockout = Math.floor(currentStock / avgDailySales);
            const reorderDate = new Date();
            reorderDate.setDate(reorderDate.getDate() + Math.max(0, daysUntilStockout - 7)); // Reorder 7 days before

            forecasts.push({
                productId: product.id,
                productName: product.name,
                currentStock,
                averageDailySales: Math.round(avgDailySales * 100) / 100,
                daysUntilStockout,
                suggestedReorderDate: reorderDate.toISOString().split("T")[0],
                suggestedReorderQuantity: Math.ceil(avgDailySales * 30), // 30 days of stock
            });
        }
    }

    // Sort by urgency (lowest days until stockout first)
    return forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout).slice(0, 15);
}

/**
 * Cached implementation of Sentiment Deep Dive
 */
const _getSentimentDeepDive = unstable_cache(async (): Promise<SentimentDeepDive> => {
    const reviews = await prisma.review.findMany({
        select: { rating: true, comment: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    });

    if (reviews.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            positiveKeywords: [],
            negativeKeywords: [],
            recentTrend: "stable",
            highlightReviews: [],
        };
    }

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    // Simple keyword extraction (common words in positive vs negative reviews)
    const positiveReviews = reviews.filter(r => r.rating >= 4);
    const negativeReviews = reviews.filter(r => r.rating <= 2);

    const extractKeywords = (reviewList: typeof reviews): Map<string, number> => {
        const wordCount = new Map<string, number>();
        const stopWords = new Set(["the", "a", "an", "is", "it", "to", "and", "of", "for", "in", "on", "with", "my", "i", "was", "very", "this", "that", "but"]);

        for (const review of reviewList) {
            if (!review.comment) continue;
            const words = review.comment.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
            for (const word of words) {
                if (word.length > 3 && !stopWords.has(word)) {
                    wordCount.set(word, (wordCount.get(word) || 0) + 1);
                }
            }
        }
        return wordCount;
    };

    const positiveWords = extractKeywords(positiveReviews);
    const negativeWords = extractKeywords(negativeReviews);

    const sortByCount = (map: Map<string, number>) =>
        Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

    // Calculate recent trend
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekReviews = reviews.filter(r => r.createdAt >= weekAgo);
    const lastWeekReviews = reviews.filter(r => r.createdAt >= twoWeeksAgo && r.createdAt < weekAgo);

    const thisWeekAvg = thisWeekReviews.length > 0
        ? thisWeekReviews.reduce((a, r) => a + r.rating, 0) / thisWeekReviews.length
        : avgRating;
    const lastWeekAvg = lastWeekReviews.length > 0
        ? lastWeekReviews.reduce((a, r) => a + r.rating, 0) / lastWeekReviews.length
        : avgRating;

    let recentTrend: "improving" | "declining" | "stable" = "stable";
    if (thisWeekAvg - lastWeekAvg > 0.3) recentTrend = "improving";
    else if (lastWeekAvg - thisWeekAvg > 0.3) recentTrend = "declining";

    // Get highlight reviews (best and worst recent)
    const highlightReviews = [
        ...positiveReviews.slice(0, 2),
        ...negativeReviews.slice(0, 2),
    ].map(r => ({
        rating: r.rating,
        content: r.comment?.slice(0, 200) || "",
        date: r.createdAt.toISOString().split("T")[0],
    }));

    return {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
        positiveKeywords: sortByCount(positiveWords),
        negativeKeywords: sortByCount(negativeWords),
        recentTrend,
        highlightReviews,
    };
}, ['sentiment-deep-dive'], { revalidate: 300 });

/**
 * Get deep sentiment analysis from reviews
 */
export async function getSentimentDeepDive(): Promise<SentimentDeepDive> {
    return _getSentimentDeepDive();
}

// ============================================================
// EXPANDED ANALYTICS (BENCHMARKS & SCENARIOS)
// ============================================================

const LUXURY_BENCHMARKS = {
    conversionRate: 1.6, // 1.6% (Based on 2025 Luxury/Jewelry Industry Data)
    returnRate: 18.7, // 18.7% (Luxury Fashion E-commerce Avg)
    sentiment: 4.2, // Industry Standard for Premium Brands
    aov: 2500, // Estimated $2.5k AOV for Luxury Watches
};

export interface BenchmarkComparison {
    metric: string;
    ourValue: number;
    industryValue: number;
    status: "leading" | "lagging" | "par";
    delta: number;
}

export interface ScenarioResult {
    spendIncrease: number;
    projectedRevenue: number;
    projectedOrders: number;
    roi: number;
}

export interface VoCCluster {
    topic: string;
    sentiment: number;
    volume: number;
    keywords: string[];
}

/**
 * Compare our metrics against real industry benchmarks
 */
export async function getCompetitorBenchmarks(): Promise<BenchmarkComparison[]> {
    const snapshot = await getBusinessSnapshot();
    const sentiment = await getReviewSentiment();

    // Calculate our conversion rate (Orders / Unique Visitors) - approximating visitors as 50 * orders for now (2% conv)
    // In real app, would track visitors. 
    const estimatedVisitors = snapshot.orders.thisMonth * 50;
    const ourConversion = estimatedVisitors > 0 ? (snapshot.orders.thisMonth / estimatedVisitors) * 100 : 0;

    // Calculate AOV
    const ourAOV = snapshot.orders.thisMonth > 0 ? snapshot.revenue.thisMonth / snapshot.orders.thisMonth : 0;

    return [
        {
            metric: "Conversion Rate",
            ourValue: 2.1, // Hardcoded approximation for demo (Our simulated rate)
            industryValue: LUXURY_BENCHMARKS.conversionRate,
            status: 2.1 > LUXURY_BENCHMARKS.conversionRate ? "leading" : "lagging",
            delta: 2.1 - LUXURY_BENCHMARKS.conversionRate
        },
        {
            metric: "Avg Order Value",
            ourValue: Math.round(ourAOV),
            industryValue: LUXURY_BENCHMARKS.aov,
            status: ourAOV > LUXURY_BENCHMARKS.aov ? "leading" : "lagging",
            delta: ((ourAOV - LUXURY_BENCHMARKS.aov) / LUXURY_BENCHMARKS.aov) * 100
        },
        {
            metric: "Cust. Sentiment",
            ourValue: sentiment.averageRating,
            industryValue: LUXURY_BENCHMARKS.sentiment,
            status: sentiment.averageRating >= LUXURY_BENCHMARKS.sentiment ? "leading" : "lagging",
            delta: sentiment.averageRating - LUXURY_BENCHMARKS.sentiment
        }
    ];
}

/**
 * Simulate financial scenarios based on basic elasticity models
 */
export async function simulateScenario(marketingSpendMultiplier: number): Promise<ScenarioResult> {
    // Multiplier 1.0 = 0% increase. 1.2 = 20% increase.
    const revenueForecast = await getRevenueForecast(30);
    const baseRevenue = revenueForecast.projectedMonthly;

    // Assume 0.8 elasticity (10% spend increase = 8% revenue increase) - typical for mature luxury
    const elasticity = 0.8;
    const spendChange = marketingSpendMultiplier - 1; // 0.2
    const revenueChange = spendChange * elasticity; // 0.16

    const projectedRevenue = baseRevenue * (1 + revenueChange);
    const projectedOrders = Math.round((revenueForecast.averageDailyRevenue * 30 * (1 + revenueChange)) / 3000); // approx order size

    return {
        spendIncrease: Math.round(spendChange * 100),
        projectedRevenue: Math.round(projectedRevenue),
        projectedOrders,
        roi: revenueChange > 0 ? (revenueChange * baseRevenue) / (spendChange * 10000) : 0 // Mock ROI calc
    };
}

/**
 * Cluster reviews into topics (Voice of Customer)
 */
export async function getVoCClusters(): Promise<VoCCluster[]> {
    const reviews = await prisma.review.findMany({
        select: { comment: true, rating: true }
    });

    const topics = {
        "Quality & Craftsmanship": ["build", "quality", "finish", "material", "feel", "weight", "polish"],
        "Service & Shipping": ["ship", "delivery", "box", "package", "packaging", "arrive", "service", "support"],
        "Value & Pricing": ["price", "value", "cost", "worth", "expensive", "cheap", "deal"],
        "Design & Style": ["look", "style", "design", "color", "dial", "strap", "beautiful", "stunning"]
    };

    const clusters: VoCCluster[] = [];

    for (const [topic, keywords] of Object.entries(topics)) {
        const relevantReviews = reviews.filter(r =>
            r.comment && keywords.some(k => r.comment!.toLowerCase().includes(k))
        );

        if (relevantReviews.length > 0) {
            const avgSentiment = relevantReviews.reduce((a, r) => a + r.rating, 0) / relevantReviews.length;
            clusters.push({
                topic,
                sentiment: Math.round(avgSentiment * 10) / 10,
                volume: relevantReviews.length,
                keywords
            });
        }
    }

    return clusters.sort((a, b) => b.volume - a.volume);
}

/**
 * Get daily win/risk highlights
 */
export async function getDailyHighlights() {
    const snapshot = await getBusinessSnapshot();
    const inventory = await getInventoryAlerts();

    const win = {
        title: "Revenue Surge",
        description: `Revenue is up ${Math.round(((snapshot.revenue.today - snapshot.revenue.yesterday) / snapshot.revenue.yesterday) * 100)}% compared to yesterday.`,
        type: "win" as const
    };

    const risk = {
        title: "Inventory Risk",
        description: `${inventory.filter(i => i.status === "critical").length} products are at critical stock levels.`,
        type: "risk" as const
    };

    if (snapshot.revenue.today < snapshot.revenue.yesterday) {
        win.title = "Order Volume";
        win.description = `${snapshot.orders.today} new orders processed efficiently.`;
    }

    return { win, risk };
}

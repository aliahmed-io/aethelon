import prisma from "@/lib/db";

export async function getPredictiveAnalytics() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const data = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: thirtyDaysAgo
            }
        },
        select: {
            amount: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // 1. Group by Day into continuous series
    const dailyRevenue: Record<string, number> = {};
    data.forEach((order: any) => {
        const date = order.createdAt.toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.amount / 100);
    });

    // Generate continuous date array for the last 30 days
    const continuousSeries = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        continuousSeries.push({
            date: dateStr,
            revenue: dailyRevenue[dateStr] || 0
        });
    }

    // 2. Simple Linear Regression
    const n = continuousSeries.length;
    if (n < 2) return { historical: continuousSeries, forecast: [] };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    continuousSeries.forEach((pt, i) => {
        sumX += i;
        sumY += pt.revenue;
        sumXY += i * pt.revenue;
        sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 3. Generate Forecast for next 7 days with organic easing
    const forecast = [];
    const lastDate = new Date();

    // Baseline shift to make the forecast connect visually closer to recent averages
    const last7Days = continuousSeries.slice(-7).map(s => s.revenue);
    const recentAvg = last7Days.reduce((a, b) => a + b, 0) / 7;

    for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);
        const dateStr = nextDate.toISOString().split('T')[0];

        // Base linear prediction
        const linearPred = slope * (n + i) + intercept;

        // Blend the regression with the recent average and add a slight organic wave
        const blended = (linearPred * 0.4) + (recentAvg * 0.6) + (Math.sin(i) * (recentAvg * 0.15));

        forecast.push({
            date: dateStr,
            revenue: Math.max(0, blended) // No negative revenue
        });
    }

    return {
        historical: continuousSeries,
        forecast
    };
}

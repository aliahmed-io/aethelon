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

    // 1. Group by Day
    const dailyRevenue: Record<string, number> = {};
    data.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.amount / 100);
    });

    const sortedDates = Object.keys(dailyRevenue).sort();
    const series = sortedDates.map(date => ({ date, revenue: dailyRevenue[date] }));

    // 2. Simple Linear Regression
    // x = day index, y = revenue
    const n = series.length;
    if (n < 2) return { historical: series, forecast: [] };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    series.forEach((pt, i) => {
        sumX += i;
        sumY += pt.revenue;
        sumXY += i * pt.revenue;
        sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 3. Generate Forecast for next 7 days
    const forecast = [];
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);

    for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);
        const dateStr = nextDate.toISOString().split('T')[0];

        // y = mx + b
        const prediction = slope * (n + i) + intercept;

        forecast.push({
            date: dateStr,
            predictedRevenue: Math.max(0, prediction) // No negative revenue
        });
    }

    return {
        historical: series,
        forecast
    };
}

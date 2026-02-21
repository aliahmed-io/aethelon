"use client";

import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    AreaChart,
} from "recharts";

interface ChartProps {
    data: {
        date: string;
        revenue: number;
    }[];
}

const aggregateData = (data: { date: string; revenue: number }[]) => {
    const aggregated = data.reduce<Record<string, number>>((acc, curr) => {
        // Format date nicely (e.g. "Jan 23")
        const d = new Date(curr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (acc[d]) {
            acc[d] += curr.revenue;
        } else {
            acc[d] = curr.revenue;
        }
        return acc;
    }, {});

    return Object.keys(aggregated).map((date) => ({
        date,
        revenue: aggregated[date],
    }));
};

export function DashboardChart({ data, forecast }: { data: ChartProps["data"], forecast?: ChartProps["data"] }) {
    // Merge data: Historical first, then forecast
    // For forecast, we align the start with the last historical point if possible, or just append
    const processedHistorical = aggregateData(data).map(d => ({ ...d, type: "Actual" }));
    const processedForecast = forecast ? aggregateData(forecast).map(d => ({ ...d, type: "Predicted", revenue: 0, predicted: d.revenue })) : [];

    // Combine for display
    // We want a continuous line. The last point of actual should connect to first of predicted.
    // For simplicity, let's just render them. 
    // Wait, separate datasets might be better if we want different styling.
    // Let's rely on Recharts ability to plot multiple keys.

    // We need a unified array where historical pts have { revenue: X, predicted: null }
    // and forecast pts have { revenue: null, predicted: Y }

    const combinedData = [
        ...processedHistorical.map(d => ({ date: d.date, actual: d.revenue, predicted: null })),
        ...processedForecast.map(d => ({ date: d.date, actual: null, predicted: d.predicted }))
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/95 border border-border p-3 rounded-sm backdrop-blur-md shadow-lg text-xs">
                    <p className="text-muted-foreground mb-1">{label}</p>
                    {payload.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <p className="text-foreground font-mono font-bold">
                                {entry.name}: ${new Intl.NumberFormat("en-US").format(entry.value)}
                            </p>
                        </div>
                    ))}
                </div>
            )
        }
        return null;
    }

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9912B" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#C9912B" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(0,0,0,0.1)"
                        tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="rgba(0,0,0,0.1)"
                        tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10 }}
                        tickFormatter={(val) => `$${val}`}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }} />
                    <Area
                        type="monotone"
                        dataKey="actual"
                        name="Revenue"
                        stroke="#C9912B"
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        connectNulls
                    />
                    <Area
                        type="monotone"
                        dataKey="predicted"
                        name="Forecast"
                        stroke="#10B981"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#colorPredict)"
                        connectNulls
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

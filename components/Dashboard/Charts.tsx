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

export function DashboardChart({ data }: ChartProps) {
    const processedData = aggregateData(data);

    // Custom tooltip for light theme
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/95 border border-border p-3 rounded-sm backdrop-blur-md shadow-lg text-xs">
                    <p className="text-muted-foreground mb-1">{label}</p>
                    <p className="text-foreground font-mono font-bold">
                        ${new Intl.NumberFormat("en-US").format(payload[0].value)}
                    </p>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9912B" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#C9912B" stopOpacity={0} />
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
                        dataKey="revenue"
                        stroke="#C9912B" // Aethelon Gold
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

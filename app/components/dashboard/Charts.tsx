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

    // Need custom tooltip for glass effect
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0A0A0C]/90 border border-white/10 p-3 rounded-sm backdrop-blur-md shadow-xl text-xs">
                    <p className="text-white/60 mb-1">{label}</p>
                    <p className="text-white font-mono font-bold">
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
                            <stop offset="5%" stopColor="#fff" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        tickFormatter={(val) => `$${val}`}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#fff"
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

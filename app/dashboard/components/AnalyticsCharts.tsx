"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

interface RevenueChartProps {
    data: { date: string; revenue: number; orders: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "4px",
                            fontSize: "12px"
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                        formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ffffff"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

interface OrdersChartProps {
    data: { date: string; orders: number }[];
}

export function OrdersChart({ data }: OrdersChartProps) {
    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "4px",
                            fontSize: "12px"
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                    />
                    <Bar
                        dataKey="orders"
                        fill="rgba(255,255,255,0.2)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface ComparisonStatsProps {
    current: number;
    previous: number;
    label: string;
    format?: "currency" | "number";
}

export function ComparisonStats({ current, previous, label, format = "number" }: ComparisonStatsProps) {
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    const isPositive = change >= 0;

    const formatValue = (val: number) => {
        if (format === "currency") {
            return `$${val.toLocaleString()}`;
        }
        return val.toLocaleString();
    };

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{label}</p>
            <div className="flex items-end justify-between">
                <p className="text-2xl font-light text-white">{formatValue(current)}</p>
                <div className="text-right">
                    <span className={`text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? "+" : ""}{change.toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-white/30">vs prev period</p>
                </div>
            </div>
        </div>
    );
}

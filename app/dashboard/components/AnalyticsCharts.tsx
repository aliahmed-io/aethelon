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
                            <stop offset="5%" stopColor="#C9912B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#C9912B" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(0,0,0,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="rgba(0,0,0,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid rgba(0,0,0,0.1)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "black",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                        itemStyle={{ color: "black" }}
                        labelStyle={{ color: "rgba(0,0,0,0.5)" }}
                        formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C9912B"
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
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(0,0,0,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="rgba(0,0,0,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid rgba(0,0,0,0.1)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                        labelStyle={{ color: "rgba(0,0,0,0.5)" }}
                        itemStyle={{ color: "black" }}
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Bar
                        dataKey="orders"
                        fill="#C9912B"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
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
        <div className="p-4 bg-card border border-border rounded-sm shadow-sm group hover:shadow-md transition-all">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
            <div className="flex items-end justify-between">
                <p className="text-2xl font-light text-foreground">{formatValue(current)}</p>
                <div className="text-right">
                    <span className={`text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}{change.toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-muted-foreground">vs prev period</p>
                </div>
            </div>
        </div>
    );
}

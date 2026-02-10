"use client";

import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    AreaChart,
    BarChart,
    Bar,
    ComposedChart,
    Line,
    Legend
} from "recharts";

// --- Types ---
interface SparklineProps {
    data: any[];
    color?: string;
}

interface StatChartProps {
    data: any[];
}

// --- Components ---

// 1. Sparkline (for Top Cards)
export function SparklineChart({ data, color = "#4ade80" }: SparklineProps) {
    return (
        <div className="w-full h-[60px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} barSize={4} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={() => null} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
// Note: The top cards in the image look like Bar charts (vertical lines), so I used BarChart.

// 2. Seller Statistic (Bar Chart)
export function SellerStatChart({ data }: StatChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis hide />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0A0A0C', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="profit" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// 3. Total Sale (Line/Area Chart) - Image 2 shows blue bars actually?
// Actually looking closely at Image 2 - "Total sale" has thin blue bars spaced out widely.
export function TotalSaleChart({ data }: StatChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis hide />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0A0A0C', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={4} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// 4. Sale / Purchase Return (Complex Mixed Chart)
// Image 3: Line chart (multiple lines) on top, Bar chart below (faded).
// Actually it looks like ComposedChart.
export function MixedReturnChart({ data }: StatChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data}>
                <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="time"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis hide />
                <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0C', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                />
                {/* Background Bars */}
                <Bar dataKey="volume" fill="#e2e8f0" fillOpacity={0.1} barSize={20} radius={[2, 2, 0, 0]} />

                {/* Lines */}
                <Line type="monotone" dataKey="sales" stroke="#fb923c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="returns" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="orders" stroke="#f87171" strokeWidth={2} dot={false} />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

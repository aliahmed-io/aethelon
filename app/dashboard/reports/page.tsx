import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Download
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportButton } from "./ExportButton";

// Mock data for sparklines (in a real app, this would come from the DB)
const sparkData1 = [40, 55, 45, 60, 50, 65, 55, 70];
const sparkData2 = [60, 50, 65, 55, 70, 65, 75, 80];
const sparkData3 = [30, 40, 35, 50, 45, 60, 55, 90];

async function getReportData() {
    const [totalRevenue, totalOrders, totalUsers] = await Promise.all([
        prisma.order.aggregate({ _sum: { amount: true } }),
        prisma.order.count(),
        prisma.user.count(),
    ]);

    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { User: true },
    });

    return {
        revenue: totalRevenue._sum.amount || 0,
        orders: totalOrders,
        users: totalUsers,
        recentOrders,
    };
}

// Simple Sparkline Component
function SparklineChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const height = 40;
    const width = 120;
    const points = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((d - min) / (max - min)) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    const data = await getReportData();

    // Mock counts for display
    const counts = {
        orders: data.orders,
        revenue: data.revenue,
        customers: data.users,
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Reports</h2>
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                        <span>Financial Overview</span>
                        <span>•</span>
                        <span>Last 30 Days</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ExportButton type="orders" label="" variant="outline" className="h-9 w-9 p-0 border-border text-foreground hover:bg-muted" />
                    <ExportButton type="revenue" label="Export Revenue" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4 h-9" />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border border-border p-6 rounded-sm text-foreground shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                                <Wallet className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Total Orders</p>
                                <h3 className="text-2xl font-light text-foreground mt-1">{counts.orders.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center text-emerald-600 text-[10px] font-bold gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3" /> 1.56%
                        </div>
                    </div>
                    <div className="h-16">
                        <SparklineChart data={sparkData1} color="#C9912B" />
                    </div>
                </Card>

                <Card className="bg-card border border-border p-6 rounded-sm text-foreground shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Total Revenue</p>
                                <h3 className="text-2xl font-light text-foreground mt-1">{formatPrice(counts.revenue)}</h3>
                            </div>
                        </div>
                        <div className="flex items-center text-emerald-600 text-[10px] font-bold gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3" /> 2.4%
                        </div>
                    </div>
                    <div className="h-16">
                        <SparklineChart data={sparkData2} color="#059669" />
                    </div>
                </Card>

                <Card className="bg-card border border-border p-6 rounded-sm text-foreground shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                                <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Active Customers</p>
                                <h3 className="text-2xl font-light text-foreground mt-1">{counts.customers.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center text-rose-500 text-[10px] font-bold gap-1 mt-1">
                            <ArrowDownRight className="w-3 h-3" /> 0.5%
                        </div>
                    </div>
                    <div className="h-16">
                        <SparklineChart data={sparkData3} color="#E11D48" />
                    </div>
                </Card>
            </div>

            {/* Detailed Table Section */}
            <Card className="bg-card border border-border rounded-sm shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Recent Transactions</h3>
                        <p className="text-xs text-muted-foreground mt-1">Latest financial activity across all channels</p>
                    </div>
                    <Button variant="ghost" className="h-8 text-xs hover:bg-muted text-muted-foreground">View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] uppercase tracking-widest bg-muted/30 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.recentOrders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-muted-foreground text-xs">#{order.id.slice(-6)}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{order.User?.email || "Guest"}</td>
                                    <td className="px-6 py-4 text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-medium text-foreground">{formatPrice(order.amount / 100)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

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
import { getPredictiveAnalytics } from "@/lib/analytics";

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
    const { historical, forecast } = await getPredictiveAnalytics();

    // Fetch live Engine Metrics from the backend Edge cache
    const storeMetrics = await prisma.storeMetrics.findFirst({
        where: { id: "singleton" }
    }) || {
        arCheckoutRate: 6.2, standardCheckoutRate: 1.1, vaultAov: 4850, standardAov: 1240,
        arReturnRate: 2.4, standardReturnRate: 18.5, estimatedSavings: 12450,
        semanticQueries: [
            { query: "dark modern reading chair apartment", path: "Routed to Executive Chair", color: "emerald", status: "CONVERTED (0.92)" },
            { query: "huge living room centerpiece minimal", path: "Routed to Atelier Sofa", color: "amber", status: "CLICKED (0.88)" },
            { query: "velvet blue ottoman lounge", path: "0 Results Found", color: "rose", status: "MISS" }
        ],
        abandonedValue: 45000, recovered1Hr: 4200, recovered24Hr: 2100,
        funnelAddedToCart: 12.4, funnelReachedCheckout: 8.1, funnelPurchased: 4.2,
        repeatCustomerRate: 18.5, firstTimePercentage: 81.5, returningPercentage: 18.5,
        topLandingPages: [
            { path: "/", visits: 12450, trend: "up", val: "12%" },
            { path: "/products/atelier-sofa", visits: 8240, trend: "up", val: "8%" },
            { path: "/products/executive-chair", visits: 6120, trend: "down", val: "3%" }
        ],
        deviceDesktop: "42%", deviceMobile: "54%", deviceTablet: "4%",
        trafficSources: [
            { source: "Direct", visits: 15200, trend: "up", val: "5%" },
            { source: "Organic Search", visits: 8400, trend: "up", val: "12%" },
            { source: "Referral", visits: 3200, trend: "down", val: "2%" }
        ],
        socialSources: [
            { source: "Instagram", visits: 6400, trend: "up", val: "18%" },
            { source: "TikTok", visits: 4200, trend: "up", val: "24%" },
            { source: "Pinterest", visits: 1800, trend: "down", val: "4%" }
        ]
    } as any;

    // Mock counts for display
    const counts = {
        orders: data.orders,
        revenue: data.revenue,
        customers: data.users,
        aov: data.orders > 0 ? data.revenue / data.orders : 0,
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <Card className="bg-card border border-border p-6 rounded-sm text-foreground shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Avg Order Value</p>
                                <h3 className="text-2xl font-light text-foreground mt-1">{formatPrice(counts.aov)}</h3>
                            </div>
                        </div>
                        <div className="flex items-center text-emerald-600 text-[10px] font-bold gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3" /> 4.2%
                        </div>
                    </div>
                    <div className="h-16">
                        <SparklineChart data={sparkData1} color="#3B82F6" />
                    </div>
                </Card>
            </div>

            {/* Advanced Shopify-Parity Analytics Row */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* 1. Conversion Funnel & Repeat Rate */}
                <div className="space-y-8">
                    <Card className="p-6 bg-card border-border text-foreground shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Conversion Funnel</h3>
                            <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5 bg-emerald-100 px-1.5 py-0.5 rounded-sm"><TrendingUp className="w-3 h-3" /> {storeMetrics.funnelPurchased}%</span>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Added to cart</span>
                                <div className="flex gap-4">
                                    <span className="text-xs font-mono font-medium">{storeMetrics.funnelAddedToCart}%</span>
                                    <span className="text-xs text-emerald-600 font-mono">↑ 4.0</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Reached checkout</span>
                                <div className="flex gap-4">
                                    <span className="text-xs font-mono font-medium">{storeMetrics.funnelReachedCheckout}%</span>
                                    <span className="text-xs text-emerald-600 font-mono">↑ 2.0</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Purchased</span>
                                <div className="flex gap-4">
                                    <span className="text-xs font-mono font-medium text-accent">{storeMetrics.funnelPurchased}%</span>
                                    <span className="text-xs text-emerald-600 font-mono">↑ 1.4</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-card border-border text-foreground shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Repeat Customer Rate</h3>
                        </div>
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-3xl font-light tracking-tight">{storeMetrics.repeatCustomerRate}%</span>
                            <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 mb-1"><TrendingUp className="w-3 h-3" /> 2.6%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                            <div className="bg-purple-500 h-full" style={{ width: `${storeMetrics.firstTimePercentage}%` }}></div>
                            <div className="bg-emerald-500 h-full" style={{ width: `${storeMetrics.returningPercentage}%` }}></div>
                        </div>
                        <div className="flex gap-4 mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> First time ({storeMetrics.firstTimePercentage}%)</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Returning ({storeMetrics.returningPercentage}%)</div>
                        </div>
                    </Card>
                </div>

                {/* 2. Top Landing Pages & Devices */}
                <div className="space-y-8">
                    <Card className="p-6 bg-card border-border text-foreground shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Top Landing Pages</h3>
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] text-muted-foreground hover:text-foreground">View report</Button>
                        </div>
                        <div className="space-y-4">
                            {(storeMetrics.topLandingPages || []).map((page: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-accent hover:underline cursor-pointer truncate max-w-[120px]">{page.path}</span>
                                    <div className="flex gap-4 text-right">
                                        <span className="font-mono text-muted-foreground w-12">{page.visits}</span>
                                        <span className={`font-mono w-10 flex items-center justify-end gap-0.5 ${page.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {page.trend === 'up' ? '↑' : '↓'} {page.val}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-card border-border text-foreground shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Visits by Device</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-foreground font-medium">Desktop</span>
                                <div className="flex gap-4 text-right">
                                    <span className="font-mono text-muted-foreground">{storeMetrics.deviceDesktop}</span>
                                    <span className="font-mono text-emerald-600 w-10 text-right">↑ 2.1%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-foreground font-medium">Mobile (AR)</span>
                                <div className="flex gap-4 text-right">
                                    <span className="font-mono text-muted-foreground">{storeMetrics.deviceMobile}</span>
                                    <span className="font-mono text-red-500 w-10 text-right">↓ 4.8%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span className="font-medium">Tablet</span>
                                <div className="flex gap-4 text-right">
                                    <span className="font-mono">{storeMetrics.deviceTablet}</span>
                                    <span className="font-mono w-10 text-right">-</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 3. Traffic Sources & Social Sources */}
                <div className="space-y-8">
                    <Card className="p-6 bg-card border-border text-foreground shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Traffic Sources</h3>
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] text-muted-foreground hover:text-foreground">View report</Button>
                        </div>
                        <div className="space-y-4">
                            {(storeMetrics.trafficSources || []).map((src: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-foreground font-medium">{src.source}</span>
                                    <div className="flex gap-4 text-right">
                                        <span className="font-mono text-muted-foreground w-8">{src.visits}</span>
                                        <span className={`font-mono w-10 flex items-center justify-end gap-0.5 ${src.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {src.trend === 'up' ? '↑' : '↓'} {src.val}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-card border-border text-foreground shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Social Sources</h3>
                        </div>
                        <div className="space-y-4">
                            {(storeMetrics.socialSources || []).map((src: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-foreground font-medium">{src.source}</span>
                                    <div className="flex gap-4 text-right">
                                        <span className="font-mono text-muted-foreground w-8">{src.visits}</span>
                                        <span className={`font-mono w-10 flex items-center justify-end gap-0.5 ${src.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {src.trend === 'up' ? '↑' : '↓'} {src.val}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
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
        </div >
    );
}

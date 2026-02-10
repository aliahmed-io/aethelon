import Prisma from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wallet, DollarSign, Users, RefreshCcw, MoreHorizontal, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SellerStatChart, TotalSaleChart, MixedReturnChart, SparklineChart } from "@/components/dashboard/NewReportCharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RevenueChart } from "../components/AnalyticsCharts";
import { ConversionFunnelChart } from "../components/ConversionFunnelChart";
import { getConversionFunnel } from "@/lib/analytics/conversion-funnel";
import { getDailyRevenue } from "@/app/store/actions";

export const dynamic = "force-dynamic";

// --- Mock Data Generators ---
const generateSparkData = (count: number) => Array.from({ length: count }, (_, i) => ({
    name: i,
    value: Math.floor(Math.random() * 50) + 20
}));

const generateStatsData = () => Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.floor(Math.random() * 5000) + 2000,
    profit: Math.floor(Math.random() * 3000) + 1000,
}));

// Hourly data for the Mixed Chart
const generateMixedData = () => Array.from({ length: 12 }, (_, i) => ({
    time: `${12 + (i % 12)}.00`,
    sales: Math.floor(Math.random() * 100) + 50,
    returns: Math.floor(Math.random() * 60) + 20,
    orders: Math.floor(Math.random() * 40) + 10,
    volume: Math.floor(Math.random() * 200) + 100, // For the background bars
}));

async function getReportData() {
    // We'll mix real counts with the visual mock data for charts
    const [totalOrders, totalUsers, totalRevenue, funnelData, rawChartData] = await Promise.all([
        Prisma.order.count(),
        Prisma.user.count(),
        Prisma.order.aggregate({ _sum: { amount: true } }),
        getConversionFunnel(30),
        getDailyRevenue() as Promise<any[]>
    ]);

    const orders = await Prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { User: true }
    });

    // Adapt data for RevenueChart
    const revenueData = rawChartData.map(d => ({
        date: d.name,
        revenue: d.total,
        orders: Math.floor(d.total / 500)
    }));

    return {
        counts: {
            orders: totalOrders,
            users: totalUsers,
            revenue: (totalRevenue._sum.amount || 0) / 100,
        },
        transactions: orders as any[],
        funnel: funnelData,
        revenueData
    };
}

export default async function ReportsPage() {
    const { counts, transactions, funnel, revenueData } = await getReportData();

    // Mock Chart Data
    const sparkData1 = generateSparkData(40);
    const sparkData2 = generateSparkData(40);
    const sparkData3 = generateSparkData(40);

    const sellerData = generateStatsData();
    const mixedData = generateMixedData();

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-light tracking-tight uppercase text-white">Reports</h2>
                </div>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/30">
                    <span>Dashboard</span>
                    <span className="opacity-50">/</span>
                    <span>Analytics</span>
                    <span className="opacity-50">/</span>
                    <span className="text-white">Live Report</span>
                </div>
            </div>

            {/* Row 1: Top Cards (Sparklines) */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Total Amount */}
                <Card className="bg-white/5 backdrop-blur-md p-6 rounded-sm border border-white/10 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                                <Wallet className="w-4 h-4 text-white/60" />
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Total Orders</p>
                                <h3 className="text-2xl font-light text-white mt-1">{counts.orders.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center text-emerald-400 text-[10px] font-bold gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3" /> 1.56%
                        </div>
                    </div>
                    <div className="h-16">
                        <SparklineChart data={sparkData1} color="rgba(255,255,255,0.4)" />
                    </div>
                </Card>

                {/* 2. Total Revenue */}
                <Card className="bg-white/5 backdrop-blur-md p-6 rounded-sm border border-white/10 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                                <DollarSign className="w-4 h-4 text-white/60" />
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Total Revenue</p>
                                <h3 className="text-2xl font-light text-white mt-1">{formatPrice(counts.revenue)}</h3>
                            </div>
                        </div>
                        <div className="flex items-center text-red-400 text-[10px] font-bold gap-1 mt-1">
                            <ArrowDownRight className="w-3 h-3" /> 1.56%
                        </div>
                    </div>
                    <div className="h-16">
                        <SparklineChart data={sparkData2} color="rgba(255,255,255,0.4)" />
                    </div>
                </Card>

                {/* 3. Total Customer */}
                <Card className="bg-white/5 backdrop-blur-md p-6 rounded-sm border border-white/10 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                                <Users className="w-4 h-4 text-white/60" />
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Total Customer</p>
                                <h3 className="text-2xl font-light text-white mt-1">{counts.users.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center text-white/20 text-[10px] font-bold gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3" /> 0.00%
                        </div>
                    </div>
                    <div className="h-16">
                        <SparklineChart data={sparkData3} color="rgba(255,255,255,0.4)" />
                    </div>
                </Card>
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 p-6 bg-white/[0.03] border-white/10 text-white backdrop-blur-sm rounded-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Revenue Analysis</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Daily revenue projection</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-7 text-[10px] border-white/10 bg-white/5 text-white/60 hover:text-white uppercase tracking-widest">
                                30 Days
                            </Button>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <RevenueChart data={revenueData} />
                    </div>
                </Card>

                <Card className="col-span-3 p-6 bg-white/[0.03] border-white/10 text-white backdrop-blur-sm rounded-sm">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Conversion Funnel</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Visitor to Purchase conversion</p>
                    </div>
                    <ConversionFunnelChart
                        stages={funnel.stages}
                        overallRate={funnel.overallConversionRate}
                    />
                </Card>
            </div>

            {/* Row 2: Middle Charts (Seller Statistic, Total Sale) */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Seller Statistic */}
                <Card className="bg-white/5 border-white/10 p-6 rounded-sm text-white backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Seller statistic</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-widest border-white/10 text-white/40 hover:text-white">Last 30 days</Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 border-white/10 text-white/40 hover:text-white">
                                <Download className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Revenue
                            </div>
                            <div className="flex items-center gap-2 font-light text-xl">
                                {formatPrice(counts.revenue)}
                                <span className="text-emerald-400 text-xs font-normal flex items-center"><ArrowUpRight className="w-3 h-3" /> 0.56%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span> Profit
                            </div>
                            <div className="flex items-center gap-2 font-light text-xl transition-all">
                                {formatPrice(counts.revenue * 0.75)}
                                <span className="text-emerald-400 text-xs font-normal flex items-center"><ArrowUpRight className="w-3 h-3" /> 0.56%</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] opacity-80">
                        <SellerStatChart data={sellerData} />
                    </div>
                </Card>

                {/* Total Sale */}
                <Card className="bg-white/5 border-white/10 p-6 rounded-sm text-white backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Total sale</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-widest border-white/10 text-white/40 hover:text-white">Last 30 days</Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 border-white/10 text-white/40 hover:text-white">
                                <Download className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Total
                            </div>
                            <div className="flex items-center gap-2 font-light text-xl">
                                {counts.orders.toLocaleString()}
                                <span className="text-emerald-400 text-xs font-normal flex items-center"><ArrowUpRight className="w-3 h-3" /> 1.2%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span> Conversion
                            </div>
                            <div className="flex items-center gap-2 font-light text-xl">
                                3.4%
                                <span className="text-emerald-400 text-xs font-normal flex items-center"><ArrowUpRight className="w-3 h-3" /> 0.1%</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] opacity-80">
                        <TotalSaleChart data={sellerData} />
                    </div>
                </Card>
            </div>

            {/* Row 3: Sale / Purchase Return */}
            <Card className="bg-white/5 border-white/10 p-8 rounded-sm text-white backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Sale / Purchase return</h3>
                        <div className="flex items-center gap-3 mt-4">
                            <h2 className="text-4xl font-light tracking-tighter text-white">$84.86B</h2>
                            <span className="text-red-400 text-xs font-medium flex items-center bg-red-500/10 px-3 py-1 rounded-sm"><ArrowDownRight className="w-4 h-4 mr-1" /> 1.02%</span>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all">
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </div>
                <div className="h-[350px] opacity-90">
                    <MixedReturnChart data={mixedData} />
                </div>
            </Card>

            {/* Row 4: Transfer History (Table) */}
            <Card className="bg-white/5 border-white/10 p-6 rounded-sm text-white backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Activity Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-white/30 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-5 font-bold">Transaction Id</th>
                                <th className="px-6 py-5 font-bold">Client / Entity</th>
                                <th className="px-6 py-5 font-bold">Timestamp</th>
                                <th className="px-6 py-5 font-bold">Settlement</th>
                                <th className="px-6 py-5 font-bold text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {transactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5 font-mono text-[10px] text-white/20 group-hover:text-white/40">#{t.id.slice(-8).toUpperCase()}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-7 h-7 border border-white/10">
                                                <AvatarImage src={t.User?.profileImage || ""} />
                                                <AvatarFallback className="bg-white/5 text-white/30 text-[8px]">{t.User?.firstName?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-white/70 group-hover:text-white transition-colors text-xs">{t.User?.firstName} {t.User?.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-white/30 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-5 font-mono text-white/80 text-xs">{formatPrice(t.amount / 100)}</td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/5"><Download className="w-3.5 h-3.5" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/5"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                                        </div>
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

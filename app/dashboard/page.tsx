import Prisma from "@/lib/db";
export const dynamic = "force-dynamic";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingBag, Users, Activity, TrendingUp, TrendingDown, ArrowUpRight, Star, MoreHorizontal } from "lucide-react";
import { DashboardChart } from "@/components/dashboard/Charts";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { getDailyRevenue } from "@/app/store/actions";
import { SystemHealthWidget } from "@/components/dashboard/SystemHealthWidget";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

async function getStats() {
    const [totalRevenue, totalOrders, paidOrders, products, reviews, recentOrders] = await Promise.all([
        Prisma.order.aggregate({ _sum: { amount: true } }),
        Prisma.order.count(),
        Prisma.order.count({ where: { status: { in: ["delivered", "shipped", "pending"] } } }),
        Prisma.product.findMany({ take: 5, orderBy: { price: 'desc' } }),
        Prisma.review.findMany({
            take: 4,
            orderBy: { createdAt: 'desc' },
            include: { User: true }
        }),
        Prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                orderItems: {
                    take: 1,
                    include: {
                        product: true // Fixed: Product -> product (lowercase)
                    }
                }
            }
        })
    ]);

    const totalVisitors = 34945;

    return {
        revenue: (totalRevenue._sum.amount || 0) / 100,
        orders: totalOrders,
        paidOrders: paidOrders,
        products: products,
        visitors: totalVisitors,
        reviews: reviews as any[],
        recentOrders: recentOrders as any[]
    };
}

export default async function DashboardPage() {
    const stats = await getStats();
    const chartData = await getDailyRevenue();

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-light tracking-tight uppercase text-white">Dashboard</h2>
                    <p className="text-white/40 text-sm mt-1">Overview of your store&apos;s performance</p>
                </div>
                <SystemHealthWidget />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 bg-white/5 border-white/10 text-white backdrop-blur-sm group hover:bg-white/10 transition-colors">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-500/20 rounded-full">
                                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Total Sales</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold font-mono text-white">{stats.orders.toLocaleString()}</span>
                            <span className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" /> +1.56%
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white/5 border-white/10 text-white backdrop-blur-sm group hover:bg-white/10 transition-colors">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-500/20 rounded-full">
                                <DollarSign className="w-4 h-4 text-orange-400" />
                            </div>
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Total Income</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold font-mono text-white">{formatPrice(stats.revenue)}</span>
                            <span className="text-xs text-red-400 font-medium mb-1 flex items-center gap-0.5">
                                <TrendingDown className="w-3 h-3" /> 1.56%
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white/5 border-white/10 text-white backdrop-blur-sm group hover:bg-white/10 transition-colors">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-full">
                                <Activity className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Orders Paid</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold font-mono text-white">{stats.paidOrders.toLocaleString()}</span>
                            <span className="text-xs text-white/30 font-medium mb-1 flex items-center gap-0.5">
                                <ArrowUpRight className="w-3 h-3" /> 0.00%
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white/5 border-white/10 text-white backdrop-blur-sm group hover:bg-white/10 transition-colors">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-full">
                                <Users className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Total Visitors</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold font-mono text-white">{stats.visitors.toLocaleString()}</span>
                            <span className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" /> +12.5%
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Middle Section: Revenue & Best Sellers */}
            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2 p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Revenue Trends</h3>
                    </div>
                    <DashboardChart data={chartData} />
                </Card>

                <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Best Shop Sellers</h3>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-white/40 hover:text-white">View all</Button>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: "Robert", category: "Kitchen, Pets", total: 1000, color: "bg-emerald-500/20 text-emerald-400" },
                            { name: "Calvin", category: "Health, Grocery", total: 4000, color: "bg-blue-500/20 text-blue-400" },
                            { name: "Dwight", category: "Electronics", total: 2700, color: "bg-orange-500/20 text-orange-400" },
                            { name: "Cody", category: "Movies, Music", total: 2100, color: "bg-purple-500/20 text-purple-400" },
                            { name: "Bruce", category: "Sports, Fitness", total: 4400, color: "bg-indigo-500/20 text-indigo-400" },
                        ].map((seller, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center ${seller.color}`}>
                                    <span className="text-xs font-bold">{seller.name[0]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white truncate">{seller.name}</h4>
                                    <p className="text-xs text-white/40 truncate">{seller.category}</p>
                                </div>
                                <div className="text-sm font-mono text-emerald-400">
                                    {formatPrice(seller.total)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Main Content Layout: Left (Product Overview, Recent Orders) and Right (Top Products, Global Reach) */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Product Overview Table */}
                    <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Product Overview</h3>
                            <Link href="/dashboard/products">
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-white/40 hover:text-white">View all</Button>
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-white/40 uppercase bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-sm">Name</th>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3 rounded-tr-sm text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.products.map((product) => (
                                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-white/5 border border-white/10">
                                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                    </div>
                                                    <span className="font-medium text-white truncate max-w-[150px]">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-white/50">#{product.id.slice(-4)}</td>
                                            <td className="px-4 py-3 text-white/80">{formatPrice(product.price)}</td>
                                            <td className="px-4 py-3 text-white/80">32</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`px-2 py-1 rounded-sm text-[10px] uppercase tracking-wide border
                                                    ${product.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                                                    {product.status === 'published' ? 'Active' : product.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Recent Orders */}
                    <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Recent Order</h3>
                            <Link href="/dashboard/orders">
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-white/40 hover:text-white">View all</Button>
                            </Link>
                        </div>
                        <Suspense fallback={<div className="text-white/30 text-sm">Loading sales...</div>}>
                            <RecentSales />
                        </Suspense>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Top Products (List View) */}
                    <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Top Products</h3>
                            <Link href="/dashboard/products">
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-white/40 hover:text-white">View all</Button>
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {stats.products.map((product) => (
                                <div key={product.id} className="flex items-center gap-4 group">
                                    <div className="relative w-12 h-12 bg-white/5 rounded-md overflow-hidden flex-shrink-0 border border-white/10">
                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-200 transition-colors">{product.name}</h4>
                                        <p className="text-xs text-white/40">{formatPrice(product.price)}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-mono text-emerald-400">High Demand</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Global Reach */}
                    <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-white/60">Global Reach</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { country: "United Arab Emirates", flag: "🇦🇪", sales: stats.revenue * 0.45, trend: "up" },
                                { country: "Switzerland", flag: "🇨🇭", sales: stats.revenue * 0.25, trend: "up" },
                                { country: "United States", flag: "🇺🇸", sales: stats.revenue * 0.15, trend: "down" },
                                { country: "United Kingdom", flag: "🇬🇧", sales: stats.revenue * 0.15, trend: "up" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{item.flag}</span>
                                        <span className="text-sm text-white/80">{item.country}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs font-bold text-white">{formatPrice(item.sales)}</span>
                                        {item.trend === 'up' ?
                                            <TrendingUp className="w-3 h-3 text-emerald-500" /> :
                                            <TrendingDown className="w-3 h-3 text-red-500" />
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Orders | Earnings | Comments */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* 1. Orders Card */}
                <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold tracking-tight">Orders</h3>
                        <MoreHorizontal className="w-4 h-4 text-white/40" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between text-xs text-white/40 font-medium uppercase tracking-wider mb-2">
                            <span>Product</span>
                            <span>Price</span>
                        </div>
                        {stats.recentOrders.map((order: any) => {
                            const orderItem = order.orderItems[0];
                            const product = orderItem?.product; // Fixed: Product -> product

                            return (
                                <div key={order.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-white/5 border border-white/10">
                                            {product && product.images && product.images[0] ? (
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-white/5" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white truncate max-w-[120px]">{product?.name || "Product"}</span>
                                            <span className="text-[10px] text-white/40">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono text-white/80">{formatPrice(order.amount / 100)}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* 2. Earnings Card */}
                <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold tracking-tight">Earnings</h3>
                        <MoreHorizontal className="w-4 h-4 text-white/40" />
                    </div>

                    <div className="space-y-6 mb-auto">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-white/40 uppercase">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold font-mono">{formatPrice(stats.revenue)}</span>
                                <span className="text-xs text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> 0.56%</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                                <span className="text-xs text-white/40 uppercase">Profit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold font-mono">{formatPrice(stats.revenue * 0.75)}</span>
                                <span className="text-xs text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> 0.56%</span>
                            </div>
                        </div>
                    </div>

                    {/* Simple Bar Chart Visualization Mock */}
                    <div className="flex items-end justify-between h-32 gap-2 mt-6">
                        {[40, 65, 30, 70, 45, 80, 55, 35].map((h, i) => (
                            <div key={i} className="w-full bg-blue-500/20 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                                <div className="absolute inset-0 bg-blue-500 opacity-50 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute bottom-0 w-full bg-blue-500 opacity-80" style={{ height: '40%' }} /> {/* Profit portion */}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-white/30 font-mono">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                    </div>
                </Card>

                {/* 3. New Comments Card */}
                <Card className="p-6 bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold tracking-tight">New Comments</h3>
                        <MoreHorizontal className="w-4 h-4 text-white/40" />
                    </div>

                    <div className="space-y-6">
                        {stats.reviews.length > 0 ? (stats.reviews as any[]).map((review) => (
                            <div key={review.id} className="flex gap-4">
                                <Avatar className="w-10 h-10 border border-white/10">
                                    <AvatarImage src={review.User?.profileImage || ""} />
                                    <AvatarFallback className="bg-white/10 text-xs">{(review.User?.firstName?.[0] || "U").toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-white">{review.User?.firstName || "Anonymous"}</h4>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-white/20"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-white/30 text-center">
                                <p>No new comments</p>
                                <p className="text-xs mt-1">They will appear here once customers review products.</p>
                            </div>
                        )}

                        {/* Fallback mockup if no reviews exist to show the design */}
                        {stats.reviews.length === 0 && (
                            <>
                                <div className="flex gap-4 opacity-50">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-24 bg-white/10 rounded" />
                                        <div className="h-3 w-full bg-white/10 rounded" />
                                        <div className="h-3 w-2/3 bg-white/10 rounded" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-white/20 mt-4">(Visual placeholder)</p>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

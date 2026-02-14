import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Your Orders — Aethelon",
    description: "View and manage your Aethelon furniture orders.",
};

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
    DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>;
}) {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser || !kindeUser.id) {
        redirect("/api/auth/login?post_login_redirect_url=/orders");
    }

    const { status: filterStatus, page: pageStr } = await searchParams;
    const page = Math.max(1, parseInt(pageStr || "1", 10));
    const pageSize = 10;

    const where: Record<string, unknown> = { userId: kindeUser.id };
    if (filterStatus && ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(filterStatus)) {
        where.status = filterStatus;
    }

    const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                orderItems: { take: 3 },
            },
        }),
        prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-4xl px-6 lg:px-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter mb-2">Your Orders</h1>
                    <p className="text-sm text-muted-foreground">{totalCount} order{totalCount !== 1 ? "s" : ""} total</p>
                </header>

                {/* Status filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {[
                        { label: "All", value: undefined },
                        { label: "Pending", value: "PENDING" },
                        { label: "Shipped", value: "SHIPPED" },
                        { label: "Delivered", value: "DELIVERED" },
                        { label: "Cancelled", value: "CANCELLED" },
                    ].map((f) => (
                        <Link
                            key={f.label}
                            href={f.value ? `/orders?status=${f.value}` : "/orders"}
                            className={`px-4 py-2 text-xs uppercase tracking-widest rounded-sm border transition-colors ${filterStatus === f.value || (!filterStatus && !f.value)
                                    ? "bg-accent text-accent-foreground border-accent"
                                    : "bg-transparent text-muted-foreground border-border hover:border-foreground"
                                }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {/* Orders list */}
                {orders.length === 0 ? (
                    <div className="text-center py-16 border border-border rounded-sm">
                        <p className="text-muted-foreground mb-4">No orders found.</p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs rounded-sm"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block border border-border rounded-sm p-6 hover:border-accent transition-colors group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-sm font-medium group-hover:text-accent transition-colors">
                                            Order #{order.id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                month: "long", day: "numeric", year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-mono font-bold">{formatPrice(order.amount / 100)}</span>
                                        <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold border rounded-sm ${STATUS_STYLES[order.status] || "bg-muted text-foreground border-border"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Item previews */}
                                <div className="flex gap-3">
                                    {order.orderItems.map((item) => (
                                        <div key={item.id} className="w-14 h-14 bg-muted rounded-sm overflow-hidden relative flex-shrink-0 border border-border">
                                            {item.image && (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {order.orderItems.length === 0 && (
                                        <span className="text-xs text-muted-foreground">No items</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Order pagination">
                        {page > 1 && (
                            <Link
                                href={`/orders?${filterStatus ? `status=${filterStatus}&` : ""}page=${page - 1}`}
                                className="px-4 py-2 border border-border text-xs uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
                            >
                                Previous
                            </Link>
                        )}
                        <span className="text-xs text-muted-foreground font-mono px-4">
                            Page {page} of {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link
                                href={`/orders?${filterStatus ? `status=${filterStatus}&` : ""}page=${page + 1}`}
                                className="px-4 py-2 border border-border text-xs uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
                            >
                                Next
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </main>
    );
}

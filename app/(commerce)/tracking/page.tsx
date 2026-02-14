import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Package, Truck, CheckCircle, Clock, Search } from "lucide-react";

export const metadata: Metadata = {
    title: "Track Your Order — Aethelon",
    description: "Enter your order number to track the status of your Aethelon furniture delivery.",
};

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
    CREATED: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Processing" },
    PAYMENT_PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Processing" },
    PAID: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Processing" },
    ALLOCATED: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Processing" },
    PARTIALLY_SHIPPED: { icon: Truck, color: "text-blue-600", bg: "bg-blue-100", label: "In Transit" },
    SHIPPED: { icon: Truck, color: "text-blue-600", bg: "bg-blue-100", label: "In Transit" },
    DELIVERED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100", label: "Delivered" },
    CANCELLED: { icon: Package, color: "text-red-600", bg: "bg-red-100", label: "Cancelled" },
    FAILED: { icon: Package, color: "text-red-600", bg: "bg-red-100", label: "Failed" },
    REFUNDED: { icon: Package, color: "text-red-600", bg: "bg-red-100", label: "Refunded" },
};

async function lookupOrder(query: string) {
    if (!query || query.length < 3) return null;

    // Try full ID first, then suffix match
    let order = await prisma.order.findUnique({
        where: { id: query },
        include: {
            orderItems: { take: 4 },
            shipments: true,
        },
    });

    // If not found by exact ID, try matching the last 6 chars
    if (!order) {
        const orders = await prisma.order.findMany({
            where: { id: { endsWith: query.toLowerCase() } },
            take: 1,
            include: {
                orderItems: { take: 4 },
                shipments: true,
            },
        });
        order = orders[0] || null;
    }

    return order;
}

export default async function TrackingPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const order = q ? await lookupOrder(q) : null;

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-2xl px-6 lg:px-12">
                <header className="text-center mb-12">
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter mb-4">Track Your Order</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your order number to see the current status and shipping details.
                    </p>
                </header>

                {/* Search form */}
                <form className="mb-12" action="/tracking" method="GET">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={q || ""}
                                placeholder="Order number (e.g. A1B2C3)"
                                className="w-full h-14 pl-12 pr-4 bg-muted/50 border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors font-mono"
                                required
                                minLength={3}
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-14 px-8 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs rounded-sm hover:bg-accent/90 transition-colors"
                        >
                            Track
                        </button>
                    </div>
                </form>

                {/* Results */}
                {q && !order && (
                    <div className="text-center py-16 border border-border rounded-sm">
                        <Package className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">No order found for &ldquo;{q}&rdquo;</p>
                        <p className="text-xs text-muted-foreground">
                            Check your order confirmation email for the correct order number.
                        </p>
                    </div>
                )}

                {order && (() => {
                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG["CREATED"];
                    const StatusIcon = config.icon;
                    const shipment = (order as any).shipments?.[0];

                    return (
                        <div className="border border-border rounded-sm overflow-hidden">
                            {/* Status banner */}
                            <div className={`${config.bg} p-6 flex items-center gap-4`}>
                                <StatusIcon className={`w-8 h-8 ${config.color}`} />
                                <div>
                                    <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
                                    <p className="text-xs text-foreground/60 font-mono">
                                        Order #{order.id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Shipping details */}
                            {shipment && (
                                <div className="p-6 border-b border-border">
                                    <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">Shipping</h2>
                                    <div className="space-y-2 text-sm">
                                        {shipment.trackingNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tracking #</span>
                                                <span className="font-mono">{shipment.trackingNumber}</span>
                                            </div>
                                        )}
                                        {shipment.carrier && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Carrier</span>
                                                <span>{shipment.carrier}</span>
                                            </div>
                                        )}
                                        {shipment.eta && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Estimated Delivery</span>
                                                <span className="font-mono">
                                                    {new Date(shipment.eta).toLocaleDateString("en-US", {
                                                        weekday: "short", month: "short", day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div className="p-6">
                                <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">
                                    {(order as any).orderItems.length} item{(order as any).orderItems.length !== 1 ? "s" : ""}
                                </h2>
                                <div className="space-y-3">
                                    {(order as any).orderItems.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-muted rounded-sm overflow-hidden relative flex-shrink-0 border border-border">
                                                {item.image && (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-mono">{formatPrice(item.price / 100)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between mt-6 pt-4 border-t border-border text-sm font-bold">
                                    <span>Total</span>
                                    <span className="font-mono">{formatPrice(order.amount / 100)}</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="p-6 bg-muted/30 border-t border-border text-center">
                                <Link
                                    href={`/orders/${order.id}`}
                                    className="text-xs text-accent hover:underline uppercase tracking-widest"
                                >
                                    View Full Order Details →
                                </Link>
                            </div>
                        </div>
                    );
                })()}

                {/* Help */}
                <div className="mt-12 text-center">
                    <p className="text-xs text-muted-foreground">
                        Need help? <Link href="/contact" className="text-accent hover:underline">Contact our concierge</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

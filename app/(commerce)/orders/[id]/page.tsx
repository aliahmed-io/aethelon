import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const TIMELINE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-600", label: "Order Placed" },
    shipped: { icon: Truck, color: "text-blue-600", label: "Shipped" },
    delivered: { icon: CheckCircle, color: "text-emerald-600", label: "Delivered" },
    cancelled: { icon: XCircle, color: "text-red-600", label: "Cancelled" },
};

async function getOrder(orderId: string, userId: string) {
    return prisma.order.findFirst({
        where: { id: orderId, userId },
        include: {
            orderItems: { include: { product: true } },
            shipment: true,
            payment: true,
        },
    });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Order #${id.slice(-6).toUpperCase()} — Aethelon`,
        description: "View your order details, shipping status, and items.",
    };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser || !kindeUser.id) {
        redirect("/api/auth/login?post_login_redirect_url=/orders");
    }

    const { id } = await params;
    const order = await getOrder(id, kindeUser.id);

    if (!order) return notFound();

    const statusTimeline = ["pending", "shipped", "delivered"] as const;
    const currentIdx = statusTimeline.indexOf(order.status as typeof statusTimeline[number]);
    const isCancelled = order.status === "cancelled";

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-4xl px-6 lg:px-12">
                {/* Back link */}
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-3 h-3" />
                    All Orders
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight mb-1">
                            Order #{order.id.slice(-6).toUpperCase()}
                        </h1>
                        <p className="text-xs text-muted-foreground font-mono">
                            Placed {new Date(order.createdAt).toLocaleDateString("en-US", {
                                weekday: "long", month: "long", day: "numeric", year: "numeric",
                            })}
                        </p>
                    </div>
                    <div className={`px-4 py-2 text-xs uppercase tracking-widest font-bold border rounded-sm ${order.status === "delivered" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                            order.status === "shipped" ? "bg-blue-100 text-blue-800 border-blue-200" :
                                order.status === "cancelled" ? "bg-red-100 text-red-800 border-red-200" :
                                    "bg-amber-100 text-amber-800 border-amber-200"
                        }`}>
                        {order.status}
                    </div>
                </div>

                {/* Timeline */}
                {!isCancelled && (
                    <div className="mb-12">
                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-6">Order Timeline</h2>
                        <div className="flex items-center justify-between">
                            {statusTimeline.map((step, i) => {
                                const config = TIMELINE_CONFIG[step];
                                if (!config) return null;
                                const IconComponent = config.icon;
                                const isActive = i <= currentIdx;
                                return (
                                    <div key={step} className="flex flex-1 items-center">
                                        <div className={`flex flex-col items-center ${isActive ? config.color : "text-muted-foreground/40"}`}>
                                            <IconComponent className="w-6 h-6 mb-2" />
                                            <span className="text-[10px] uppercase tracking-widest font-mono">{config.label}</span>
                                        </div>
                                        {i < statusTimeline.length - 1 && (
                                            <div className={`flex-1 h-px mx-4 ${i < currentIdx ? "bg-accent" : "bg-border"}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-6">Items</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 border border-border rounded-sm">
                                    <div className="w-20 h-20 bg-muted rounded-sm overflow-hidden relative flex-shrink-0">
                                        {item.image && (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium truncate">{item.name}</h3>
                                        {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-sm font-mono">{formatPrice(item.price / 100)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary sidebar */}
                    <div className="space-y-6">
                        {/* Order total */}
                        <div className="p-6 border border-border rounded-sm">
                            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-mono">{formatPrice((order.amount - order.shippingCost) / 100)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-mono">{order.shippingCost > 0 ? formatPrice(order.shippingCost / 100) : "Free"}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border font-bold">
                                    <span>Total</span>
                                    <span className="font-mono">{formatPrice(order.amount / 100)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping address */}
                        {order.shippingName && (
                            <div className="p-6 border border-border rounded-sm">
                                <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">Ship To</h2>
                                <p className="text-sm font-medium">{order.shippingName}</p>
                                <p className="text-xs text-muted-foreground">{order.shippingStreet1}</p>
                                {order.shippingStreet2 && <p className="text-xs text-muted-foreground">{order.shippingStreet2}</p>}
                                <p className="text-xs text-muted-foreground">
                                    {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                                </p>
                            </div>
                        )}

                        {/* Tracking info */}
                        {order.shipment?.trackingNumber && (
                            <div className="p-6 border border-border rounded-sm">
                                <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">Tracking</h2>
                                <p className="text-sm font-mono">{order.shipment.trackingNumber}</p>
                                {order.shipment.carrier && (
                                    <p className="text-xs text-muted-foreground mt-1">via {order.shipment.carrier}</p>
                                )}
                                {order.shipment.eta && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ETA: {new Date(order.shipment.eta).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Payment */}
                        {order.payment && (
                            <div className="p-6 border border-border rounded-sm">
                                <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">Payment</h2>
                                <p className="text-sm">{order.payment.provider}</p>
                                <p className={`text-xs uppercase tracking-widest mt-1 ${order.payment.status === "COMPLETED" ? "text-emerald-600" :
                                        order.payment.status === "FAILED" ? "text-red-600" :
                                            "text-muted-foreground"
                                    }`}>
                                    {order.payment.status}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

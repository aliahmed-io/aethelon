import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Package, Heart, MapPin, Settings } from "lucide-react";

export const metadata: Metadata = {
    title: "Your Account — Aethelon",
    description: "Manage your Aethelon account, view orders, and update your preferences.",
};

export const dynamic = "force-dynamic";

async function getProfileData(userId: string) {
    const [user, recentOrders, wishlistCount, addresses] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 3,
            include: { orderItems: { take: 1 } },
        }),
        prisma.wishlistItem.count({ where: { userId } }),
        prisma.address.findMany({ where: { userId }, take: 3, orderBy: { isDefault: "desc" } }),
    ]);

    return { user, recentOrders, wishlistCount, addresses };
}

export default async function ProfilePage() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser || !kindeUser.id) {
        redirect("/api/auth/login?post_login_redirect_url=/profile");
    }

    const { user, recentOrders, wishlistCount, addresses } = await getProfileData(kindeUser.id);

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-4xl px-6 lg:px-12">
                {/* Header */}
                <div className="flex items-center gap-6 mb-12 pb-8 border-b border-border">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                        {user?.profileImage ? (
                            <Image
                                src={user.profileImage}
                                alt={`${user.firstName}'s avatar`}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground font-bold">
                                {kindeUser.given_name?.[0]?.toUpperCase() || "A"}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {user?.firstName || kindeUser.given_name} {user?.lastName || kindeUser.family_name}
                        </h1>
                        <p className="text-sm text-muted-foreground">{kindeUser.email}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "recently"}
                        </p>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <Link href="/orders" className="p-6 border border-border rounded-sm hover:border-accent transition-colors group">
                        <Package className="w-5 h-5 text-muted-foreground group-hover:text-accent mb-3" />
                        <span className="text-2xl font-bold font-mono block">{recentOrders.length}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Recent Orders</span>
                    </Link>
                    <Link href="/wishlist" className="p-6 border border-border rounded-sm hover:border-accent transition-colors group">
                        <Heart className="w-5 h-5 text-muted-foreground group-hover:text-accent mb-3" />
                        <span className="text-2xl font-bold font-mono block">{wishlistCount}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Wishlist</span>
                    </Link>
                    <div className="p-6 border border-border rounded-sm">
                        <MapPin className="w-5 h-5 text-muted-foreground mb-3" />
                        <span className="text-2xl font-bold font-mono block">{addresses.length}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Addresses</span>
                    </div>
                    <div className="p-6 border border-border rounded-sm">
                        <Settings className="w-5 h-5 text-muted-foreground mb-3" />
                        <span className="text-2xl font-bold font-mono block">—</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Settings</span>
                    </div>
                </div>

                {/* Recent Orders */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-mono">Recent Orders</h2>
                        <Link href="/orders" className="text-xs text-accent hover:underline">View all →</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-sm">
                            No orders yet. <Link href="/shop" className="text-accent hover:underline">Start shopping</Link>
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="flex items-center justify-between p-4 border border-border rounded-sm hover:border-accent transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-sm overflow-hidden relative flex-shrink-0">
                                            {order.orderItems[0]?.image && (
                                                <Image
                                                    src={order.orderItems[0].image}
                                                    alt={order.orderItems[0].name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium group-hover:text-accent transition-colors">
                                                Order #{order.id.slice(-6).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono">{formatPrice(order.amount / 100)}</span>
                                        <span className={`block text-[10px] uppercase tracking-wider mt-1 ${order.status === "delivered" ? "text-emerald-600" :
                                                order.status === "shipped" ? "text-blue-600" :
                                                    order.status === "cancelled" ? "text-red-600" :
                                                        "text-muted-foreground"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Addresses */}
                <section>
                    <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-mono mb-6">Saved Addresses</h2>
                    {addresses.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center border border-border rounded-sm">
                            No saved addresses.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} className="p-4 border border-border rounded-sm">
                                    {addr.isDefault && (
                                        <span className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2 block">Default</span>
                                    )}
                                    <p className="text-sm font-medium">{addr.name}</p>
                                    <p className="text-xs text-muted-foreground">{addr.street1}</p>
                                    {addr.street2 && <p className="text-xs text-muted-foreground">{addr.street2}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        {addr.city}, {addr.state} {addr.postalCode}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

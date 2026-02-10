import { Button } from "@/components/ui/button";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ShoppingBag, Trash2, Tag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { delItem } from "@/app/store/actions";
import { redis } from "@/lib/redis";
import { Cart } from "@/lib/interfaces";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice } from "@/lib/utils";

export const metadata = {
    title: "Your Bag | Aethelon",
};

export default async function BagPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return redirect("/api/auth/login");

    let cart: Cart | null = null;
    if (redis) {
        try {
            cart = (await redis.get(`cart-${user.id}`)) as Cart | null;
        } catch {
            cart = null;
        }
    }

    let totalPrice = 0;
    cart?.items.forEach((item) => {
        totalPrice += item.price * item.quantity;
    });

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20 relative overflow-hidden">
            {/* Ambient Background - Warm Pulse */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(201,145,43,0.04)_0%,transparent_70%)] pointer-events-none" />
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
                <div className="flex items-center justify-between mb-12 border-b border-border pb-8">
                    <h1 className="text-3xl font-light tracking-tight uppercase">Shopping Bag</h1>
                    <p className="text-muted-foreground text-sm font-mono">{cart?.items?.length || 0} ITEMS</p>
                </div>

                {!cart || !cart.items || cart.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-light mb-4">Your bag is empty</h2>
                        <p className="text-muted-foreground mb-8 max-w-sm">Discover our collection of fine timepieces and accessories.</p>
                        <Link href="/shop">
                            <Button className="h-12 px-8 bg-accent text-accent-foreground font-bold uppercase tracking-widest hover:bg-accent/90">
                                Explore Collection
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8 space-y-8">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-6 p-6 bg-muted/50 border border-border backdrop-blur-sm rounded-sm group hover:border-accent/30 transition-colors">
                                    <div className="relative w-24 h-24 bg-secondary flex-shrink-0 border border-border rounded-sm">
                                        <Image src={item.imageString} alt={item.name} fill className="object-contain p-2" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-light text-lg">{item.name}</h3>
                                                <p className="text-xs text-muted-foreground font-mono mt-1 uppercase">Size: {item.size}</p>
                                            </div>
                                            <p className="font-mono text-sm">{formatPrice(item.price)}</p>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                                            <form action={delItem}>
                                                <input type="hidden" name="productId" value={item.id} />
                                                <button type="submit" className="text-xs text-red-600 hover:text-red-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-32 p-8 bg-muted/50 border border-border backdrop-blur-md rounded-sm">
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-muted-foreground">Summary</h3>

                                <div className="space-y-4 mb-8 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-mono">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-muted-foreground text-xs uppercase">Calc at checkout</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                                        <span className="text-xl font-light font-mono">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="block w-full">
                                    <Button className="w-full h-14 bg-accent text-accent-foreground font-bold uppercase tracking-widest hover:bg-accent/90 flex items-center justify-between px-6">
                                        Checkout <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>

                                <div className="mt-8 flex items-start gap-3 p-4 bg-muted/50 rounded-sm">
                                    <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-2">Have a promo code?</p>
                                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Enter it at the next step</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

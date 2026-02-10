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
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 relative overflow-hidden">
            {/* Ambient Background - Light Pulse */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                    <h1 className="text-3xl font-light tracking-tight uppercase">Shopping Bag</h1>
                    <p className="text-white/50 text-sm font-mono">{cart?.items?.length || 0} ITEMS</p>
                </div>

                {!cart || !cart.items || cart.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-8 h-8 text-white/30" />
                        </div>
                        <h2 className="text-xl font-light mb-4">Your bag is empty</h2>
                        <p className="text-white/40 mb-8 max-w-sm">Discover our collection of fine timepieces and accessories.</p>
                        <Link href="/shop">
                            <Button className="h-12 px-8 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200">
                                Explore Collection
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8 space-y-8">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-6 p-6 bg-white/5 border border-white/5 backdrop-blur-sm rounded-sm group hover:border-white/10 transition-colors">
                                    <div className="relative w-24 h-24 bg-black/40 flex-shrink-0 border border-white/5">
                                        <Image src={item.imageString} alt={item.name} fill className="object-contain p-2" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-light text-lg">{item.name}</h3>
                                                <p className="text-xs text-white/40 font-mono mt-1 uppercase">Size: {item.size}</p>
                                            </div>
                                            <p className="font-mono text-sm">{formatPrice(item.price)}</p>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-sm text-white/50">Qty: {item.quantity}</div>
                                            <form action={delItem}>
                                                <input type="hidden" name="productId" value={item.id} />
                                                <button type="submit" className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest flex items-center gap-2">
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-32 p-8 bg-white/5 border border-white/5 backdrop-blur-md">
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white/70">Summary</h3>

                                <div className="space-y-4 mb-8 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Subtotal</span>
                                        <span className="font-mono">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Shipping</span>
                                        <span className="text-white/50 text-xs uppercase">Calc at checkout</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                                        <span className="text-xl font-light font-mono">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="block w-full">
                                    <Button className="w-full h-14 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center justify-between px-6">
                                        Checkout <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>

                                <div className="mt-8 flex items-start gap-3 p-4 bg-white/5 rounded-sm">
                                    <Tag className="w-4 h-4 text-white/40 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-white/60 mb-2">Have a promo code?</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wide">Enter it at the next step</p>
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

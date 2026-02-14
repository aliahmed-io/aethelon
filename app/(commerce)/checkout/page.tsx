import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";
import { Cart } from "@/lib/interfaces";
import { ShippingForm } from "./ShippingForm"; // We will create this next
import { Lock } from "lucide-react";

export const metadata = {
    title: "Secure Checkout | Aethelon",
};

export default async function CheckoutPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return redirect("/api/auth/login");

    let cart: Cart | null = null;
    if (redis) {
        const cartData = await redis.get(`cart-${user.id}`);
        // Redis returns string/object depending on client. Upstash via HTTP returns object if json? 
        // If using ioredis, it returns string. Code says ioredis.
        // The 'Cart | null' cast suggests previous dev assumed object, but verify.
        // Safest is to handle both.
        if (typeof cartData === 'string') {
            try {
                cart = JSON.parse(cartData);
            } catch {
                cart = null;
            }
        } else {
            cart = cartData as Cart | null;
        }
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return redirect("/bag");
    }

    const initialAddress = await prisma.address.findFirst({
        where: { userId: user.id },
    });

    return (
        <main className="min-h-screen bg-background text-foreground pt-24 pb-20 relative overflow-hidden">
            {/* Ambient Background - Warm Pulse */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(201,145,43,0.04)_0%,transparent_70%)] pointer-events-none" />

            <div className="absolute top-0 w-full h-20 border-b border-border flex items-center justify-center bg-background/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-widest">
                    <Lock className="w-4 h-4" /> Secure Checkout
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Forms */}
                <div className="lg:col-span-7">
                    <ShippingForm
                        initialAddress={initialAddress}
                        cartItems={cart.items}
                        discountCode={cart.discountCode}
                        discountPercentage={cart.discountPercentage}
                    />
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-5 relative hidden lg:block">
                    <div className="sticky top-32 p-8 bg-muted/50 border border-border backdrop-blur-md rounded-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-muted-foreground">Order Summary</h3>
                        <p className="text-xs text-muted-foreground text-center italic mt-12">
                            By placing your order, you agree to our Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

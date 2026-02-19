"use server";

import prisma from "@/lib/db";
import { Cart } from "@/lib/interfaces";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * Saves the current cart state for abandoned cart recovery.
 * Called periodically from the bag/checkout pages (client interval).
 * Upserts by userId so only the latest cart snapshot is stored.
 */
export async function saveCartForRecovery() {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();
        if (!user?.id || !user?.email) return;

        // Dynamic import to avoid circular dependency
        const { redis } = await import("@/lib/redis");
        if (!redis) return;

        const cartData = await redis.get(`cart-${user.id}`);
        if (!cartData) return;

        let cart: Cart;
        if (typeof cartData === "string") {
            try {
                cart = JSON.parse(cartData);
            } catch {
                return;
            }
        } else {
            cart = cartData as Cart;
        }

        if (!cart.items || cart.items.length === 0) return;

        const totalCents = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Upsert: only keep one active abandoned cart per user
        const existing = await prisma.abandonedCart.findFirst({
            where: {
                userId: user.id,
                recoveredAt: null,
            },
            orderBy: { createdAt: "desc" },
        });

        if (existing) {
            await prisma.abandonedCart.update({
                where: { id: existing.id },
                data: {
                    cartData: cart as object,
                    totalCents,
                    itemCount: cart.items.length,
                    email: user.email,
                },
            });
        } else {
            await prisma.abandonedCart.create({
                data: {
                    userId: user.id,
                    email: user.email,
                    cartData: cart as object,
                    totalCents,
                    itemCount: cart.items.length,
                },
            });
        }
    } catch (error) {
        // Silently fail — cart recovery is non-critical
        console.error("SaveCartForRecovery Error:", error);
    }
}

/**
 * Marks all pending abandoned carts for a user as recovered.
 * Called after successful checkout.
 */
export async function markCartRecovered(userId: string) {
    try {
        await prisma.abandonedCart.updateMany({
            where: {
                userId,
                recoveredAt: null,
            },
            data: {
                recoveredAt: new Date(),
            },
        });
    } catch (error) {
        console.error("MarkCartRecovered Error:", error);
    }
}

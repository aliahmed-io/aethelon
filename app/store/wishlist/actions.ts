"use server";

import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";

export async function toggleWishlist(productId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return { success: false, error: "Must be logged in" };
    }

    try {
        const existing = await prisma.wishlistItem.findFirst({
            where: {
                userId: user.id,
                productId
            }
        });

        if (existing) {
            await prisma.wishlistItem.delete({
                where: { id: existing.id }
            });
            revalidatePath(`/shop/${productId}`);
            return { success: true, isWishlisted: false };
        } else {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                select: { price: true }
            });

            await prisma.wishlistItem.create({
                data: {
                    userId: user.id,
                    productId,
                    addedPrice: product?.price || 0
                }
            });
            revalidatePath(`/shop/${productId}`);
            return { success: true, isWishlisted: true };
        }
    } catch (error) {
        logger.error("Wishlist Error", error);
        return { success: false, error: "Failed to update wishlist" };
    }
}

export async function getWishlistStatus(productId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return false;

    const item = await prisma.wishlistItem.findFirst({
        where: {
            userId: user.id,
            productId
        }
    });

    return !!item;
}

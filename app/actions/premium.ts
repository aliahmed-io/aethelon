"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

/**
 * Add or remove a product from the Premium collection.
 * Premium = isFeatured OR tags includes "premium" OR "rare".
 * Add: add "premium" to tags.
 * Remove: remove "premium" and "rare" from tags, set isFeatured false.
 */
export async function setProductPremium(productId: string, inPremium: boolean) {
    await requireAdmin();

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, tags: true, isFeatured: true },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    if (inPremium) {
        const tags = Array.from(new Set([...product.tags, "premium"]));
        await prisma.product.update({
            where: { id: productId },
            data: { tags },
        });
    } else {
        const tags = product.tags.filter((t) => t !== "premium" && t !== "rare");
        await prisma.product.update({
            where: { id: productId },
            data: { tags, isFeatured: false },
        });
    }

    revalidatePath("/dashboard/premium");
    revalidatePath("/vault");
}

"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteAbandonedCart(id: string) {
    await requireAdmin();

    await prisma.abandonedCart.delete({
        where: { id },
    });

    revalidatePath("/dashboard/cart-recovery");
}

export async function getCartRecoveryStats() {
    await requireAdmin();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, recovered, pending, totalValue] = await Promise.all([
        prisma.abandonedCart.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.abandonedCart.count({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                recoveredAt: { not: null },
            },
        }),
        prisma.abandonedCart.count({
            where: {
                recoveredAt: null,
                emailsSent: { lt: 2 },
            },
        }),
        prisma.abandonedCart.aggregate({
            _sum: { totalCents: true },
            where: {
                createdAt: { gte: thirtyDaysAgo },
                recoveredAt: null,
            },
        }),
    ]);

    return {
        total,
        recovered,
        pending,
        recoveryRate: total > 0 ? Math.round((recovered / total) * 100) : 0,
        abandonedValue: totalValue._sum.totalCents ?? 0,
    };
}

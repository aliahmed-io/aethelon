"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import logger from "@/lib/logger";

export async function exportProducts() {
    try {
        await requireAdmin();

        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { category: true }
        });

        const formattedData = products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price / 100,
            status: p.status,
            category: p.category?.name || "Uncategorized",
            mainCategory: p.mainCategory,
            stock: p.stockQuantity,
            createdAt: p.createdAt.toISOString()
        }));

        return { success: true, data: formattedData };
    } catch (error: any) {
        logger.error({ err: error }, "Failed to export products");
        return { success: false, message: "Server error during export" };
    }
}

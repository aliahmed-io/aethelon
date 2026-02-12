"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function restockProduct(prevState: any, formData: FormData) {
    const user = await requireAdmin();

    const productId = formData.get("productId") as string;
    const quantity = Number(formData.get("quantity"));
    const reason = formData.get("reason") as string;

    if (quantity <= 0) {
        return { message: "Quantity must be positive" };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update Product Stock
            await tx.product.update({
                where: { id: productId },
                data: {
                    stockQuantity: { increment: quantity }
                }
            });

            // 2. Create Ledger Entry
            await tx.inventoryTransaction.create({
                data: {
                    productId,
                    type: "RESTOCK",
                    quantity,
                    reason: reason || "Manual Restock",
                    referenceId: user.id // Log who did it
                }
            });
        });

        revalidatePath("/dashboard/products");
        return { message: "Stock updated successfully" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to update stock" };
    }
}

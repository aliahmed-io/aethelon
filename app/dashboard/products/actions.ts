"use server";

import prisma from "@/lib/db";
import { InventoryService } from "@/modules/inventory/inventory.service";
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
        await InventoryService.restock(productId, quantity, reason, user.id);

        revalidatePath("/dashboard/products");
        return { message: "Stock updated successfully" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to update stock" };
    }
}

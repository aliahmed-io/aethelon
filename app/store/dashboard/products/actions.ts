"use server";

import { requireAdmin } from "@/lib/auth";
import { check3DStatus } from "@/app/store/ai-actions";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function refreshMeshyStatus(productId: string, taskId: string) {
    try {
        await requireAdmin();
        const res = await check3DStatus(taskId);

        if (res.success) {
            await prisma.product.update({
                where: { id: productId },
                data: {
                    meshyStatus: res.status as string,
                    meshyProgress: res.progress as number,
                    modelUrl: (res.modelUrl as string) || undefined
                }
            });
            revalidatePath("/dashboard/products");
            revalidatePath("/store/dashboard/products");
            return { success: true, status: res.status };
        }
        return { success: false, message: res.error || "Failed to refresh" };
    } catch (error) {
        return { success: false, message: "Server error" };
    }
}

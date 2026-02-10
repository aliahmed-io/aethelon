"use server";

import Prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleRoleAction(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
        await Prisma.user.update({
            where: { id: userId },
            data: { role: newRole as "ADMIN" | "USER" }
        });
        revalidatePath("/dashboard/roles");
        return { success: true, newRole };
    } catch (e) {
        console.error("Failed to update role", e);
        throw new Error("Failed to update role");
    }
}

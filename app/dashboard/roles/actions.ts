"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function updateRoleAction(userId: string, newRole: "ADMIN" | "USER") {
    await requireAdmin();
    // Prevent self-demotion if you are the logged in user? 
    // Ideally yes, but for now we trust the admin UI to handle that or let them shoot themselves in foot if they really want.
    // Better: We just Execute exactly what is asked.

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        revalidatePath("/dashboard/roles");
        return { success: true, newRole };
    } catch (e) {
        console.error("Failed to update role", e);
        throw new Error("Failed to update role");
    }
}

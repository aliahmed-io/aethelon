"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";

export async function updateContactStatus(formData: FormData) {
    try {
        await requireAdmin();
        const id = formData.get("id") as string;
        const status = formData.get("status") as any;

        await prisma.contact.update({
            where: { id },
            data: {
                status: status,
                isRead: true
            }
        });
        revalidatePath("/dashboard/contact");
    } catch (error: any) {
        logger.error({ err: error }, "Failed to update contact status");
    }
}

export async function deleteContact(formData: FormData) {
    try {
        await requireAdmin();
        const id = formData.get("id") as string;

        await prisma.contact.delete({ where: { id } });
        revalidatePath("/dashboard/contact");
    } catch (error: any) {
        logger.error({ err: error }, "Failed to delete contact");
    }
}

export async function markAllAsRead() {
    try {
        await requireAdmin();

        await prisma.contact.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });

        revalidatePath("/dashboard/contact");
        return { success: true };
    } catch (error: any) {
        logger.error({ err: error }, "Failed to mark all as read");
        return { error: "Failed to mark as read" };
    }
}

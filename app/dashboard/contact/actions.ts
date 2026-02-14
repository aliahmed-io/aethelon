"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateContactStatus(formData: FormData) {
    await requireAdmin();
    const id = formData.get("id") as string;
    const status = formData.get("status") as "PENDING" | "COMPLETED" | "IGNORED";

    try {
        await prisma.contact.update({
            where: { id },
            data: {
                status: status,
                isRead: true
            }
        });
        revalidatePath("/dashboard/contact");
    } catch (e) {
        console.error("Failed to update contact status", e);
    }
}

export async function deleteContact(formData: FormData) {
    await requireAdmin();
    const id = formData.get("id") as string;

    try {
        await prisma.contact.delete({ where: { id } });
        revalidatePath("/dashboard/contact");
    } catch (e) {
        console.error("Failed to delete contact", e);
    }
}

"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDiscount(_prevState: unknown, formData: FormData) {
    await requireAdmin();

    const code = (formData.get("code") as string).toUpperCase().trim();
    const type = formData.get("type") as string;
    const amount = Number(formData.get("amount"));
    const expiresAt = formData.get("expiresAt") as string;

    if (!code || !type || !amount) {
        return { error: "Code, type, and amount are required." };
    }

    if (type === "PERCENTAGE" && (amount < 1 || amount > 100)) {
        return { error: "Percentage must be between 1 and 100." };
    }

    if (type === "FIXED" && amount < 1) {
        return { error: "Fixed amount must be at least 1 cent." };
    }

    // Check for duplicate code
    const existing = await prisma.discount.findUnique({ where: { code } });
    if (existing) {
        return { error: `Discount code "${code}" already exists.` };
    }

    await prisma.discount.create({
        data: {
            code,
            type,
            amount,
            active: true,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
    });

    revalidatePath("/dashboard/discounts");
    return redirect("/dashboard/discounts");
}

export async function toggleDiscount(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) return;

    await prisma.discount.update({
        where: { id },
        data: { active: !discount.active },
    });

    revalidatePath("/dashboard/discounts");
}

export async function deleteDiscount(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;

    await prisma.discount.delete({ where: { id } });

    revalidatePath("/dashboard/discounts");
}

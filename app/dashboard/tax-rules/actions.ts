"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTaxRule(formData: FormData) {
    await requireAdmin();

    const country = (formData.get("country") as string).toUpperCase().trim();
    const regionRaw = formData.get("region") as string;
    const region = regionRaw ? regionRaw.toUpperCase().trim() : null;
    const name = formData.get("name") as string;
    const rateStr = formData.get("rate") as string;
    const rate = parseFloat(rateStr) / 100; // Convert percentage to decimal
    const inclusive = formData.get("inclusive") === "on";

    if (!country || !name || isNaN(rate) || rate < 0) {
        throw new Error("Invalid tax rule data");
    }

    await prisma.taxRule.create({
        data: {
            country,
            region,
            name,
            rate,
            inclusive,
        },
    });

    revalidatePath("/dashboard/tax-rules");
}

export async function toggleTaxRule(id: string) {
    await requireAdmin();

    const rule = await prisma.taxRule.findUnique({ where: { id } });
    if (!rule) throw new Error("Tax rule not found");

    await prisma.taxRule.update({
        where: { id },
        data: { active: !rule.active },
    });

    revalidatePath("/dashboard/tax-rules");
}

export async function deleteTaxRule(id: string) {
    await requireAdmin();

    await prisma.taxRule.delete({ where: { id } });

    revalidatePath("/dashboard/tax-rules");
}

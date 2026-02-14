"use server";

import { requireAdmin } from "@/lib/auth";
import { draftEmailCampaign } from "@/lib/ai/coo";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function generateEmailDraft(context: string, suggestionId: string) {
    try {
        await requireAdmin();

        // Fetch products to include in the draft
        // As a heuristic, we take some featured products or low stock items
        const products = await prisma.product.findMany({
            where: { status: "published" },
            take: 3,
            select: { name: true, price: true, mainCategory: true }
        });

        const draft = await draftEmailCampaign(context, products);

        if (!draft) {
            return { success: false, error: "Failed to generate draft" };
        }

        return { success: true, draft };
    } catch (error) {
        logger.error(error, "Email Draft Action Error");
        return { success: false, error: "Something went wrong" };
    }
}

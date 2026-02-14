"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendEmailSafe, getResendFromEmail } from "@/lib/resend";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";

export async function sendBroadcastEmail(formData: FormData) {
    try {
        await requireAdmin();

        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        if (!subject || !message) {
            return { error: "Subject and message are required" };
        }

        // Fetch all registered users
        const users = await prisma.user.findMany({
            select: { email: true }
        });

        if (users.length === 0) {
            return { error: "No users found to send email to" };
        }

        const from = getResendFromEmail();

        // Rate limiting and batching should ideally be handled for large user bases.
        // For now, we send them sequentially (wrapped in promise.all for small-mid scale).
        // Resend handles some scale but we should be careful.

        const emailPromises = users.map(user =>
            sendEmailSafe({
                from,
                to: user.email,
                subject,
                html: `<div style="font-family: sans-serif; line-height: 1.5;">${message.replace(/\n/g, '<br/>')}</div>`
            })
        );

        await Promise.all(emailPromises);

        logger.info({ count: users.length }, "Broadcast email sent to users");

        revalidatePath("/dashboard/newsletter");
        return { success: true };
    } catch (error: any) {
        logger.error({ err: error }, "Failed to send broadcast email");
        return { error: error.message || "Failed to send email" };
    }
}

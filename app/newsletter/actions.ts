"use server";

import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export async function unsubscribe(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) return;

    try {
        await prisma.newsletterSubscriber.update({
            where: { email },
            data: { status: "unsubscribed" }
        });
    } catch (e) {
        // Ignore error if email doesn't exist, just show success UX
        console.error("Unsubscribe error:", e);
    }

    redirect("/newsletter/unsubscribe/success");
}

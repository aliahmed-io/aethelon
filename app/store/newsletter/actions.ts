"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const subscribeSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;

    const validatedFields = subscribeSchema.safeParse({
        email: email,
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors.email?.[0] || "Invalid email",
        };
    }

    try {
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existing) {
            if (existing.status === "unsubscribed") {
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: { status: "subscribed" },
                });
                return { success: true, message: "Welcome back! You've been resubscribed." };
            }
            return { error: "You are already subscribed to our newsletter." };
        }

        await prisma.newsletterSubscriber.create({
            data: {
                email,
                status: "subscribed",
            },
        });

        revalidatePath("/");
        return { success: true, message: "Thank you for subscribing to our newsletter!" };
    } catch (error) {
        console.error("Newsletter subscription error:", error);
        return { error: "Failed to subscribe. Please try again later." };
    }
}

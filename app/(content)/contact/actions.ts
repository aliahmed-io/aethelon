"use server";

import prisma from "@/lib/db";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContactForm(prevState: unknown, formData: FormData) {
    // Rate limit check omitted for simplicity in migration, can add back if needed.

    const validatedFields = contactSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
            fields: {
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                subject: formData.get("subject") as string,
                message: formData.get("message") as string,
            },
        };
    }

    try {
        await prisma.contact.create({
            data: {
                name: validatedFields.data.name,
                email: validatedFields.data.email,
                subject: validatedFields.data.subject,
                message: validatedFields.data.message,
            },
        });

        return { success: true };
    } catch (e) {
        console.error(e);
        return {
            error: "Failed to send message. Please try again.",
        };
    }
}

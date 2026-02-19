"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";

// --- VALIDATION SCHEMAS ---

export const ProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    socialTitle: z.enum(["Mr.", "Mrs."]).optional(),
    birthdate: z.string().optional(), // YYYY-MM-DD
    newsletter: z.boolean().default(false),
});

export const AddressSchema = z.object({
    name: z.string().min(1, "Alias (e.g. Home) is required"),
    street1: z.string().min(1, "Street address is required"),
    street2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().default("US"),
    phone: z.string().optional(),
    isDefault: z.boolean().default(false),
});

// --- ACTIONS ---

export async function updateUserProfile(data: z.infer<typeof ProfileSchema>) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        throw new Error("Unauthorized");
    }

    const parsed = ProfileSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Invalid data");
    }

    const { firstName, lastName, socialTitle, birthdate, newsletter } = parsed.data;

    // Update User
    await prisma.user.update({
        where: { id: user.id },
        data: {
            firstName,
            lastName,
            socialTitle,
            birthdate: birthdate ? new Date(birthdate) : null,
        },
    });

    // Update Newsletter
    const newsletterStatus = newsletter ? "subscribed" : "unsubscribed";

    // Upsert newsletter subscription
    await prisma.newsletterSubscriber.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            email: user.email!,
            status: newsletterStatus,
        },
        update: {
            status: newsletterStatus,
        },
    });

    revalidatePath("/account/profile");
    return { success: true };
}

export async function addAddress(data: z.infer<typeof AddressSchema>) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) throw new Error("Unauthorized");

    const parsed = AddressSchema.safeParse(data);
    if (!parsed.success) throw new Error("Invalid address data");

    // If setting as default, unset others first
    if (parsed.data.isDefault) {
        await prisma.address.updateMany({
            where: { userId: user.id },
            data: { isDefault: false },
        });
    }

    await prisma.address.create({
        data: {
            ...parsed.data,
            userId: user.id,
        },
    });

    revalidatePath("/account/addresses");
    return { success: true };
}

export async function updateAddress(id: string, data: z.infer<typeof AddressSchema>) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) throw new Error("Unauthorized");

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new Error("Address not found");

    const parsed = AddressSchema.safeParse(data);
    if (!parsed.success) throw new Error("Invalid address data");

    if (parsed.data.isDefault) {
        await prisma.address.updateMany({
            where: { userId: user.id },
            data: { isDefault: false },
        });
    }

    await prisma.address.update({
        where: { id },
        data: parsed.data,
    });

    revalidatePath("/account/addresses");
    return { success: true };
}

export async function deleteAddress(id: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) throw new Error("Unauthorized");

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new Error("Address not found");

    await prisma.address.delete({ where: { id } });

    revalidatePath("/account/addresses");
    return { success: true };
}

export async function setDefaultAddress(id: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) throw new Error("Unauthorized");

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) throw new Error("Address not found");

    // Unset all -> Set new default
    await prisma.$transaction([
        prisma.address.updateMany({
            where: { userId: user.id },
            data: { isDefault: false }
        }),
        prisma.address.update({
            where: { id },
            data: { isDefault: true }
        })
    ]);

    revalidatePath("/account/addresses");
    return { success: true };
}

"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type StoreSettings = {
    chatbotEnabled: boolean;
    aiSearchEnabled: boolean;
    virtualTryOnEnabled: boolean;
    maintenanceMode: boolean;
    emailNotifications: boolean;
};

const SETTINGS_KEY = "admin_settings";

const DEFAULT_SETTINGS: StoreSettings = {
    chatbotEnabled: true,
    aiSearchEnabled: true,
    virtualTryOnEnabled: true,
    maintenanceMode: false,
    emailNotifications: true,
};

export async function getSettings(): Promise<StoreSettings> {
    await requireAdmin();

    try {
        const results = await prisma.$queryRaw<Array<{ value: string | StoreSettings }>>(
            Prisma.sql`SELECT value FROM "StoreConfig" WHERE key = ${SETTINGS_KEY}`
        );

        if (!results || results.length === 0) return DEFAULT_SETTINGS;

        const raw = results[0].value;
        const saved = (typeof raw === "string" ? JSON.parse(raw) : raw) as Partial<StoreSettings>;
        return { ...DEFAULT_SETTINGS, ...saved };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function updateSettings(formData: FormData) {
    await requireAdmin();

    const settings: StoreSettings = {
        chatbotEnabled: formData.get("chatbotEnabled") === "on",
        aiSearchEnabled: formData.get("aiSearchEnabled") === "on",
        virtualTryOnEnabled: formData.get("virtualTryOnEnabled") === "on",
        maintenanceMode: formData.get("maintenanceMode") === "on",
        emailNotifications: formData.get("emailNotifications") === "on",
    };

    try {
        const jsonValue = JSON.stringify(settings);

        const existing = await prisma.$queryRaw<Array<{ key: string }>>(
            Prisma.sql`SELECT key FROM "StoreConfig" WHERE key = ${SETTINGS_KEY}`
        );

        if (existing && existing.length > 0) {
            await prisma.$executeRaw(
                Prisma.sql`UPDATE "StoreConfig" SET value = ${jsonValue}::jsonb, "updatedAt" = NOW() WHERE key = ${SETTINGS_KEY}`
            );
        } else {
            await prisma.$executeRaw(
                Prisma.sql`INSERT INTO "StoreConfig" (key, value, "updatedAt") VALUES (${SETTINGS_KEY}, ${jsonValue}::jsonb, NOW())`
            );
        }
    } catch {
        console.error("StoreConfig table not yet available. Run prisma migrate.");
    }

    revalidatePath("/dashboard/settings");
}

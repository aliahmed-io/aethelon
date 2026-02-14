"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setCurrency(currency: string) {
    (await cookies()).set("NEXT_CURRENCY", currency, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "lax"
    });
    revalidatePath("/", "layout"); // Refresh everything
}

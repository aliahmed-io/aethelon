import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

/**
 * Checks if the user is authenticated.
 * Returns the user object if authenticated, otherwise redirects to login.
 */
export async function requireUser() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        redirect("/api/auth/login");
    }

    return user;
}

/**
 * Checks if the user is an admin.
 * Returns the user object if admin, otherwise redirects to dashboard or login.
 * 
 * Logic:
 * 1. Must be authenticated.
 * 2. Must have role 'ADMIN' in database OR match hardcoded admin emails.
 */
export async function requireAdmin() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser) {
        redirect("/api/auth/login");
    }

    // Check database role
    const dbUser = await prisma.user.findUnique({
        where: { id: kindeUser.id },
        select: { role: true }
    });

    if (dbUser?.role === UserRole.ADMIN) {
        return kindeUser;
    }

    // Unauthorized
    redirect("/");
}

/**
 * Returns true if the current user is an admin.
 * Does NOT redirect. Secure for UI logic.
 */
export async function isAdminUser() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser) return false;

    // Check database role
    const dbUser = await prisma.user.findUnique({
        where: { id: kindeUser.id },
        select: { role: true }
    });

    return dbUser?.role === UserRole.ADMIN;
}

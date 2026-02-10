import prisma from "@/lib/db";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

export async function syncUser(user: KindeUser | { id: string; given_name?: string | null; family_name?: string | null; email?: string | null; picture?: string | null }) {
    if (!user || !user.id) {
        throw new Error("Invalid user data for sync");
    }

    let dbUser = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
    });

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                firstName: user.given_name ?? "",
                lastName: user.family_name ?? "",
                email: user.email ?? "",
                profileImage: user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
            },
        });
    }

    return dbUser;
}

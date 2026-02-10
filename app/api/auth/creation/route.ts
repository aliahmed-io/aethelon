import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: Request) {
    noStore();
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user === null || !user.id) {
        // If no user found, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
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
                // Fallback image if Kinde doesn't provide one
                profileImage: user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
            },
        });
    }

    // Redirect to Shop main page after successful login/creation
    return NextResponse.redirect(new URL("/shop", request.url));
}

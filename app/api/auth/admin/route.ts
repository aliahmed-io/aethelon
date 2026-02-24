import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";

export async function GET() {
    try {
        const isAdmin = await isAdminUser();
        return NextResponse.json({ isAdmin });
    } catch (error) {
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}

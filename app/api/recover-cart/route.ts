import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    // H-1: Validate redirect is a safe relative path to prevent open redirect phishing.
    // Reject absolute URLs (e.g. "https://evil.com") and protocol-relative URLs (e.g. "//evil.com").
    const rawRedirect = searchParams.get("redirect") || "/bag";
    const redirectPath =
        rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
            ? rawRedirect
            : "/bag";

    if (token) {
        // Set HTTP-only cookie for the session
        const cookieStore = await cookies();
        cookieStore.set("commerce_recovery_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });
    }

    // Redirect to bag or checkout (validated relative path only)
    return NextResponse.redirect(new URL(redirectPath, request.url));
}

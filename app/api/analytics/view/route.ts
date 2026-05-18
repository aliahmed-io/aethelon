import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

export async function POST(request: NextRequest) {
    if (!redis) {
        return NextResponse.json({ ok: true });
    }

    let body: { productId?: string; categoryId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { productId, categoryId } = body;
    if (!productId || !categoryId) {
        return NextResponse.json({ error: "Missing productId or categoryId" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("temp_user_id")?.value || "guest";

    try {
        const key = `user:${userId}:viewed_categories`;
        await redis.zincrby(key, 1, categoryId);
        await redis.expire(key, 60 * 60 * 24 * 7);

        const historyKey = `user:${userId}:history`;
        await redis.lpush(historyKey, productId);
        await redis.ltrim(historyKey, 0, 9);
        await redis.expire(historyKey, 60 * 60 * 24 * 7);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Analytics view error:", error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

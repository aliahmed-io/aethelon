import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export async function rateLimit(identifier: string) {
    if (!redis) {
        // Fail closed or open? Open is safer for dev/if redis is down, but closed is safer for security.
        // Given this is abuse prevention, let's just log and allow if redis is missing (fallback).
        console.warn("Redis not initialized, rate limiting disabled");
        return { success: true };
    }

    const ratelimit = new Ratelimit({
        redis: redis as any,
        limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds default
        analytics: true,
        prefix: "@upstash/ratelimit",
    });

    return await ratelimit.limit(identifier);
}

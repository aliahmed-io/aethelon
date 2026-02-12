import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import logger from "@/lib/logger";

export async function rateLimit(identifier: string, limit = 10, duration: "10 s" | "60 s" | "1 d" = "10 s") {
    if (!redis) {
        // Fail closed or open? Open is safer for dev/if redis is down, but closed is safer for security.
        // Given this is abuse prevention, let's just log and allow if redis is missing (fallback).
        logger.warn("Redis not initialized, rate limiting disabled");
        return { success: true };
    }

    const ratelimit = new Ratelimit({
        redis: redis as any,
        limiter: Ratelimit.slidingWindow(limit, duration),
        analytics: true,
        prefix: "@upstash/ratelimit",
    });

    return await ratelimit.limit(identifier);
}

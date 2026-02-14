import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import logger from "@/lib/logger";

export async function rateLimit(identifier: string, limit = 10, duration: "10 s" | "60 s" | "1 d" = "10 s") {
    if (!redis) {
        // STRATEGY: Fail CLOSED for Security.
        // Audit Requirement: Do not fail open.
        logger.error("Redis not initialized, denying request for rate limit check");
        return { success: false, limit, remaining: 0, reset: 0 };
    }

    const ratelimit = new Ratelimit({
        redis: redis as any,
        limiter: Ratelimit.slidingWindow(limit, duration),
        analytics: true,
        prefix: "@upstash/ratelimit",
    });

    return await ratelimit.limit(identifier);
}

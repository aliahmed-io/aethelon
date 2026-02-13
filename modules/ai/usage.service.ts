import prisma from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import logger from "@/lib/logger";

const MAX_DAILY_GENERATIONS = 3;
const KILL_SWITCH = process.env.ENABLE_AI_GENERATION === "false";

export class UsageService {
    /**
     * Checks if a user is allowed to generate an AI image.
     * If allowed, increments their usage count.
     * Handles daily resets automatically.
     */
    static async checkAndIncrement(userId: string): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
        if (KILL_SWITCH) {
            logger.warn("AI Generation attempted while KILL_SWITCH is active");
            return { allowed: false, reason: "AI features are temporarily disabled." };
        }

        // 1. Rate Limit (DDOS Protection) - 10 requests per minute
        const { success } = await rateLimit(`ai-gen-${userId}`, 10, "60 s");
        if (!success) {
            return { allowed: false, reason: "You are generating too fast. Please wait a moment." };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiGenerationsCount: true, lastGenerationDate: true },
        });

        if (!user) {
            return { allowed: false, reason: "User not found." };
        }

        const now = new Date();
        const lastDate = new Date(user.lastGenerationDate);
        const isToday = now.toDateString() === lastDate.toDateString();

        // 2. Daily Reset Logic
        let currentCount = isToday ? user.aiGenerationsCount : 0;

        if (currentCount >= MAX_DAILY_GENERATIONS) {
            logger.info("AI Generation limit reached", { userId, count: currentCount });
            return { allowed: false, reason: "You have reached your daily limit of 3 visualizations." };
        }

        // 3. Increment usage
        const newCount = currentCount + 1;

        await prisma.user.update({
            where: { id: userId },
            data: {
                aiGenerationsCount: newCount,
                lastGenerationDate: now,
            },
        });

        logger.info("AI Generation approved", { userId, newCount });
        return { allowed: true, remaining: MAX_DAILY_GENERATIONS - newCount };
    }

    /**
     * Get current usage stats for UI display
     */
    static async getUsage(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiGenerationsCount: true, lastGenerationDate: true },
        });

        if (!user) return { count: 0, limit: MAX_DAILY_GENERATIONS, remaining: MAX_DAILY_GENERATIONS };

        const now = new Date();
        const lastDate = new Date(user.lastGenerationDate);
        const isToday = now.toDateString() === lastDate.toDateString();
        const count = isToday ? user.aiGenerationsCount : 0;

        return {
            count,
            limit: MAX_DAILY_GENERATIONS,
            remaining: Math.max(0, MAX_DAILY_GENERATIONS - count),
        };
    }
}

import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function logAudit({
    userId,
    action,
    targetType,
    targetId,
    metadata,
}: {
    userId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    metadata?: any;
}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                targetType,
                targetId,
                metadata: metadata ? (metadata as any) : undefined,
            },
        });
    } catch (error) {
        logger.error({ err: error }, "Failed to write audit log");
    }
}

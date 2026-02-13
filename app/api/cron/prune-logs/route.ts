import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
    // 1. Authenticate Cron Request
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 2. Prune Audit Logs
        const deletedAuditLogs = await prisma.auditLog.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });

        // 3. Prune AI Interaction Logs
        const deletedAiLogs = await prisma.aiInteractionLog.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });

        logger.info(
            {
                auditLogsDeleted: deletedAuditLogs.count,
                aiLogsDeleted: deletedAiLogs.count,
            },
            "Pruned Old Logs"
        );

        return NextResponse.json({
            success: true,
            auditLogsDeleted: deletedAuditLogs.count,
            aiLogsDeleted: deletedAiLogs.count,
        });
    } catch (error) {
        logger.error(error, "Failed to prune logs");
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

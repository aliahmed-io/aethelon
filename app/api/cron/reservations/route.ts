import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { InventoryService } from "@/lib/inventory";
import logger from "@/lib/logger";

export const dynamic = 'force-dynamic';

// This route should be triggered by Vercel Cron or an external scheduler.
// Secure it with a CRON_SECRET if public access is possible.

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 1. Find Expired Orders (CREATED > 30 mins ago)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Optimization: Limit to 50 to prevent timeout. 
        // Cron should run frequently (e.g. every 5-10 mins).
        const expiredOrders = await prisma.order.findMany({
            take: 50,
            where: {
                status: "CREATED",
                createdAt: {
                    lt: thirtyMinutesAgo
                }
            },
            include: {
                orderItems: {
                    select: {
                        productId: true,
                        quantity: true
                    }
                }
            }
        });

        if (expiredOrders.length === 0) {
            return NextResponse.json({ message: "No expired reservations found" });
        }

        const results: any[] = [];

        // 2. Release Stock & Cancel Order (Parallel)
        await Promise.all(expiredOrders.map(async (order) => {
            try {
                // Ensure we don't double-cancel (Optimistic Lock check would be ideal, but status check helps)
                // Also, InventoryService.releaseReservation handles the transaction

                const itemsToRelease = order.orderItems
                    .filter(i => i.productId) // Ensure productId exists
                    .map(i => ({
                        productId: i.productId!,
                        quantity: i.quantity
                    }));

                if (itemsToRelease.length > 0) {
                    await InventoryService.releaseReservation(order.id, itemsToRelease);
                }

                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: "CANCELLED"
                        // If we added an 'EXPIRED' status, we would use it here.
                        // For now, CANCELLED is semantically correct for abandonment.
                    }
                });

                results.push({ id: order.id, status: "CANCELLED" });

            } catch (err: any) {
                logger.error(`Failed to release order ${order.id}`, err);
                results.push({ id: order.id, error: err.message });
            }
        }));

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error: any) {
        logger.error("Cron Job Failed", error);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}

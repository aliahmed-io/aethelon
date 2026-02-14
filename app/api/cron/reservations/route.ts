import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { InventoryService } from "@/modules/inventory/inventory.service";
import logger from "@/lib/logger";

export const dynamic = 'force-dynamic';

// This route should be triggered by Vercel Cron or an external scheduler.
// Secure it with a CRON_SECRET if public access is possible.

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Find Expired Orders (CREATED > 30 mins ago)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

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

        // 2. Release Stock & Cancel Order (Parallel with Map-Return)
        const results = await Promise.all(expiredOrders.map(async (order) => {
            try {
                const itemsToRelease = order.orderItems
                    .filter(i => i.productId)
                    .map(i => ({
                        productId: i.productId!,
                        quantity: i.quantity
                    }));

                if (itemsToRelease.length > 0) {
                    await InventoryService.releaseReservation(order.id, itemsToRelease);
                }

                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: "CANCELLED" }
                });

                return { id: order.id, status: "CANCELLED" };

            } catch (err: any) {
                logger.error({ err }, `Failed to release order ${order.id}`);
                return { id: order.id, error: err.message };
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

import logger from "@/lib/logger";
import { InventoryError } from "@/lib/errors";
import prisma from "@/lib/db";
import { sendEmailSafe, getResendFromEmail } from "@/lib/resend";


/**
 * Inventory Service
 * Handles stock reservation, confirmation, and ledger logging.
 * Uses strict database transactions to prevent race conditions.
 */

export class InventoryService {

    /**
     * Reserves stock for an order.
     * Throws error if insufficient stock.
     */
    static async reserveStock(orderId: string, items: { productId: string; quantity: number }[]) {
        return await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new InventoryError(`Product ${item.productId} not found`);
                }

                const available = product.stockQuantity - product.reservedStock;

                if (available < item.quantity) {
                    // Check backorder eligibility
                    if (product.allowBackorder) {
                        const backorderNeeded = item.quantity - Math.max(0, available);
                        const backorderCapacity = product.backorderLimit - product.reservedStock + product.stockQuantity;
                        if (backorderCapacity >= backorderNeeded) {
                            logger.info({ productId: item.productId, backorderNeeded }, "Backorder Reservation");
                        } else {
                            throw new InventoryError(
                                `Insufficient stock for product ${product.name}. Backorder limit exceeded.`
                            );
                        }
                    } else {
                        logger.warn({ productId: item.productId, requested: item.quantity, available }, "Insufficient Stock");
                        throw new InventoryError(
                            `Insufficient stock for product ${product.name}. Requested: ${item.quantity}, Available: ${available}`
                        );
                    }
                }

                // 1. Reserve Stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        reservedStock: { increment: item.quantity },
                    },
                });

                // 2. Create Ledger Entry
                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        type: "RESERVE",
                        quantity: item.quantity,
                        referenceId: orderId,
                        reason: available < item.quantity ? "Backorder Reservation" : "Order Reservation",
                    },
                });
            }
        });
    }

    /**
     * Confirms a sale (Paid).
     * Converts reservation to permanent deduction.
     */
    static async confirmSale(orderId: string, items: { productId: string; quantity: number }[]) {
        const lowStockProducts: { name: string; remaining: number; threshold: number }[] = [];

        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) continue;

                // 1. Decrease Reserved + Decrease Stock
                const updated = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        reservedStock: { decrement: item.quantity },
                        stockQuantity: { decrement: item.quantity },
                    },
                });

                // Check low stock threshold
                if (updated.stockQuantity <= updated.lowStockThreshold && updated.stockQuantity >= 0) {
                    lowStockProducts.push({
                        name: product.name,
                        remaining: updated.stockQuantity,
                        threshold: updated.lowStockThreshold,
                    });
                }

                // 2. Ledger: Sale
                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        type: "SALE",
                        quantity: -item.quantity,
                        unitCost: product.costPrice,
                        unitPrice: product.price,
                        referenceId: orderId,
                        reason: "Order Paid",
                    },
                });
            }
        });

        // Send low stock alert emails (non-blocking)
        if (lowStockProducts.length > 0) {
            this.sendLowStockAlert(lowStockProducts).catch((err) =>
                logger.error({ err }, "Low Stock Alert Email Failed")
            );
        }
    }

    /**
     * Sends a low stock alert email to the admin.
     */
    private static async sendLowStockAlert(
        products: { name: string; remaining: number; threshold: number }[]
    ) {
        const rows = products
            .map(
                (p) =>
                    `<tr>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: ${p.remaining <= 0 ? "#dc2626" : "#b45309"};">${p.remaining}</td>
                        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.threshold}</td>
                    </tr>`
            )
            .join("");

        const html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0a0a0a; padding: 24px; text-align: center;">
                <h1 style="color: #fafafa; font-size: 18px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin: 0;">AETHELON — LOW STOCK ALERT</h1>
            </div>
            <div style="padding: 24px;">
                <p style="color: #6b7280;">The following products have dropped below their low stock threshold:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background: #f9fafb;">
                            <th style="padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Product</th>
                            <th style="padding: 8px 12px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Remaining</th>
                            <th style="padding: 8px 12px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Threshold</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://aethelon.com"}/dashboard/products"
                   style="display: inline-block; background: #0a0a0a; color: #fafafa; padding: 10px 24px; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-top: 16px;">
                    Manage Inventory
                </a>
            </div>
        </div>`;

        await sendEmailSafe({
            from: getResendFromEmail(),
            to: process.env.ADMIN_EMAIL || getResendFromEmail(),
            subject: `⚠️ Low Stock Alert: ${products.length} product${products.length > 1 ? "s" : ""} below threshold`,
            html,
        });
    }

    /**
     * Releases reservation (e.g., Payment Failed/Expired).
     */
    static async releaseReservation(orderId: string, items: { productId: string; quantity: number }[]) {
        return await prisma.$transaction(async (tx) => {
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        reservedStock: { decrement: item.quantity }
                    }
                });

                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        type: "RELEASE",
                        quantity: item.quantity,
                        referenceId: orderId,
                        reason: "Reservation Released"
                    }
                });
            }
        });
    }

    /**
     * Handles Returns.
     * Increases stock back.
     */
    static async processReturn(returnId: string, items: { productId: string; quantity: number }[]) {
        return await prisma.$transaction(async (tx) => {
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: { increment: item.quantity }
                    }
                });

                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        type: "RETURN",
                        quantity: item.quantity,
                        referenceId: returnId,
                        reason: "Return Approved"
                    }
                });
            }
        });
    }
    /**
     * Restocks a product manually.
     */
    static async restock(productId: string, quantity: number, reason: string, userId: string) {
        if (quantity <= 0) {
            throw new InventoryError("Quantity must be positive");
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Update Product Stock
            await tx.product.update({
                where: { id: productId },
                data: {
                    stockQuantity: { increment: quantity }
                }
            });

            // 2. Create Ledger Entry
            await tx.inventoryTransaction.create({
                data: {
                    productId,
                    type: "RESTOCK",
                    quantity,
                    reason: reason || "Manual Restock",
                    referenceId: userId
                }
            });

            logger.info({ productId, quantity, userId, reason }, "Product Restocked");
        });
    }
}

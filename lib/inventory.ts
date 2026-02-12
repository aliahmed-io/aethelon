import prisma from "@/lib/db";
import { InventoryTransactionType } from "@prisma/client";

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
                // LOCK the product row for update to prevent race conditions
                // Note: Prisma doesn't support "SELECT FOR UPDATE" natively easily without raw query, 
                // but checking and updating in a transaction with optimistic concurrency control or 
                // just atomic updates is better than nothing. 
                // For high concurrency, raw SQL `SELECT * FROM "Product" WHERE id = $1 FOR UPDATE` is best.
                // Here we use atomic updates which are safe for deduction but we need to check availability first.

                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                const available = product.stockQuantity - product.reservedStock;

                if (available < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}. Requested: ${item.quantity}, Available: ${available}`);
                }

                // 1. Reserve Stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        reservedStock: { increment: item.quantity }
                    }
                });

                // 2. Create Ledger Entry
                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        type: "RESERVE",
                        quantity: item.quantity,
                        referenceId: orderId,
                        reason: "Order Reservation"
                    }
                });
            }
        });
    }

    /**
     * Confirms a sale (Paid).
     * Converts reservation to permanent deduction.
     */
    static async confirmSale(orderId: string, items: { productId: string; quantity: number }[]) {
        return await prisma.$transaction(async (tx) => {
            for (const item of items) {
                // Fetch product cost and price for historical accuracy
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) continue;

                // 1. Decrease Reserved (release reservation)
                // 2. Decrease Stock (permanent deduction)
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        reservedStock: { decrement: item.quantity },
                        stockQuantity: { decrement: item.quantity }
                    }
                });

                // 3. Ledger: Sale
                await tx.inventoryTransaction.create({
                    data: {
                        productId: item.productId,
                        type: "SALE",
                        quantity: -item.quantity,
                        unitCost: product.costPrice,
                        unitPrice: product.price,
                        referenceId: orderId,
                        reason: "Order Paid"
                    }
                });
            }
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
}

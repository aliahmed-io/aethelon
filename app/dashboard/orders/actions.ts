"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { PaymentService } from "@/modules/payments/payments.service";
import { InventoryService } from "@/modules/inventory/inventory.service";
import { sendEmailSafe } from "@/lib/resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function fulfillOrder(prevState: any, formData: FormData) {
    const user = await requireAdmin();

    const orderId = formData.get("orderId") as string;
    const trackingNumber = formData.get("trackingNumber") as string;
    const carrier = formData.get("carrier") as string;

    // Parse selected items and quantities
    // Expecting formData entries like "item_ORDER-ITEM-ID" = "quantity"
    const itemsToShip: { orderItemId: string, quantity: number }[] = [];

    for (const [key, value] of Array.from(formData.entries())) {
        if (key.startsWith("item_")) {
            const orderItemId = key.replace("item_", "");
            const quantity = Number(value);
            if (quantity > 0) {
                itemsToShip.push({ orderItemId, quantity });
            }
        }
    }

    if (itemsToShip.length === 0) {
        return { message: "No items selected for shipment" };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Shipment
            const shipment = await tx.shipment.create({
                data: {
                    orderId,
                    trackingNumber,
                    carrier,
                    status: "SHIPPED",
                    items: {
                        create: itemsToShip.map(i => ({
                            orderItemId: i.orderItemId,
                            quantity: i.quantity
                        }))
                    }
                }
            });

            // 2. Update Order Status
            // Check if fully shipped? For simplicity, mark as PARTIALLY_SHIPPED or SHIPPED
            // logic usually involves checking totals. 
            // Here we just set to SHIPPED or PARTIALLY_SHIPPED based on a guess or check.
            // Let's check remaining items? Too expensive for this MVP action right now.
            // Just update to PARTIALLY_SHIPPED if not already SHIPPED, or if we assume full.
            // User can manually update status if needed or we refine logic later.
            // For "Production Grade", we should calculate.

            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { orderItems: true, shipments: { include: { items: true } }, User: true }
            });

            if (order) {
                const totalOrdered = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
                const totalShippedSoFar = order.shipments.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0), 0) + itemsToShip.reduce((itemsAcc, i) => itemsAcc + i.quantity, 0);

                let newStatus = "PARTIALLY_SHIPPED";
                if (totalShippedSoFar >= totalOrdered) {
                    newStatus = "SHIPPED";
                }

                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: newStatus as any, // Cast to OrderStatus
                        fulfillmentStatus: totalShippedSoFar >= totalOrdered ? "FULFILLED" : "PARTIALLY_FULFILLED"
                    }
                });

                // 3. Send Email
                if (order.User?.email && process.env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: "Aethelon <shipping@aethelon.com>",
                        to: order.User.email,
                        subject: `Your Order #${orderId.slice(0, 8)} has Shipped`,
                        html: `
                            <h1>Shipping Confirmation</h1>
                            <p>Good news! Some items from your order have been shipped.</p>
                            <p>Carrier: ${carrier}</p>
                            <p>Tracking: ${trackingNumber}</p>
                            <br/>
                            <a href="${process.env.NEXT_PUBLIC_URL}/dashboard/orders/${orderId}">View Order</a>
                        `
                    });
                }
            }
        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { message: "Shipment created successfully" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to create shipment" };
    }
}

export async function processReturn(prevState: any, formData: FormData) {
    const user = await requireAdmin();

    const orderId = formData.get("orderId") as string;
    const itemsJson = formData.get("items") as string; // Expecting JSON string of { productId, quantity, condition }
    const reason = formData.get("reason") as string;

    if (!itemsJson) {
        return { message: "No items selected" };
    }

    const items: { productId: string, quantity: number, condition: "RESELLABLE" | "DAMAGED" }[] = JSON.parse(itemsJson);

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Return Request / Record
            // Assuming we accept all for now, or this action IS the approval
            const returnRecord = await tx.returnRequest.create({
                data: {
                    orderId,
                    userId: user.id, // Admin doing it, or trigger user id
                    reason,
                    status: "COMPLETED",
                    adminNotes: `Processed by ${user.email}`,
                    refundAmount: 0 // Calc functionality later
                }
            });

            // 2. Inventory Logic
            for (const item of items) {
                if (item.condition === "RESELLABLE") {
                    // Add back to stock
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stockQuantity: { increment: item.quantity } }
                    });

                    await tx.inventoryTransaction.create({
                        data: {
                            productId: item.productId,
                            type: "RETURN",
                            quantity: item.quantity,
                            referenceId: returnRecord.id,
                            reason: "Return: Resellable"
                        }
                    });
                } else {
                    // Log as damaged (Write-off)
                    // Does not increment stock, but logs transaction?
                    // Or increment then decrement?
                    // Best practice: Log it so we know it came back, but don't add to sellable stock.
                    // We use a specific type if available, otherwise just log.

                    await tx.inventoryTransaction.create({
                        data: {
                            productId: item.productId,
                            type: "RETURN", // Or new type RETURN_DAMAGED if enum supports, currently just RETURN
                            quantity: 0, // Zero qty change for main stock? Or strict accounting means we must track "Damaged Stock"?
                            // For now, we prefer not to pollute "Sellable Stock".
                            // So we log it but don't increment stockQuantity.
                            referenceId: returnRecord.id,
                            reason: "Return: Damaged/Write-off"
                        }
                    });
                }
            }

            // 3. Update Order Fulfillment Status
            await tx.order.update({
                where: { id: orderId },
                data: { fulfillmentStatus: "RETURNED" } // Simplified
            });

        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { message: "Return processed successfully" };
    } catch (e) {
        console.error(e);
        return { message: "Failed to process return" };
    }
}

export async function refundOrder(formData: FormData) {
    const admin = await requireAdmin();
    const orderId = formData.get("orderId") as string;

    if (!orderId) return { message: "Order ID required" };

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true, orderItems: true, User: true }
        });

        if (!order) return { message: "Order not found" };
        if (order.status === "REFUNDED" || order.status === "CANCELLED") return { message: "Order already cancelled/refunded" };

        // 1. Process Stripe Refund
        if (order.payment?.transactionId) {
            await PaymentService.refund(order.payment.transactionId);
        } else {
            console.warn("No payment transaction ID found for refund, skipping Stripe");
        }

        await prisma.$transaction(async (tx) => {
            // 2. Update Order Status
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: "REFUNDED",
                    paymentStatus: "REFUNDED"
                }
            });
        });

        // 3. Restock Inventory
        // We use InventoryService logic to restock and log to ledger
        await InventoryService.processReturn(orderId, order.orderItems.map(i => ({
            productId: i.productId!,
            quantity: i.quantity
        })));

        // 4. Send Notification
        if (order.User?.email) {
            await sendEmailSafe({
                from: "Aethelon <billing@aethelon.com>",
                to: order.User.email,
                subject: `Refund Processed for Order #${order.id.slice(0, 8)}`,
                html: `
                    <h1>Refund Notification</h1>
                    <p>Referencing Order #${order.id}</p>
                    <p>A refund has been issued to your original payment method.</p>
                    <p>It may take 5-10 days to appear on your statement.</p>
                `
            });
        }

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { message: "Refund processed successfully" };

    } catch (error) {
        console.error("Refund Error:", error);
        return { message: "Refund failed check logs" };
    }
}

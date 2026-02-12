import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { InventoryService } from "@/lib/inventory";
import { Resend } from "resend";
import logger from "@/lib/logger";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const body = await req.text();
    const headerStore = await headers();
    const signature = headerStore.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const orderId = session?.metadata?.orderId;

        if (!orderId) {
            logger.error("Missing orderId in metadata");
            return new NextResponse("Missing orderId", { status: 200 });
        }

        try {
            // 1. Fetch Order with Relations
            const existingOrder = await prisma.order.findUnique({
                where: { id: orderId },
                include: { orderItems: true, User: true }
            });

            if (!existingOrder) {
                logger.error("Order not found", { orderId });
                return new NextResponse("Order not found", { status: 404 });
            }

            // IDEMPOTENCY CHECK
            if (existingOrder.status === "PAID" || existingOrder.status === "ALLOCATED" || existingOrder.paymentStatus === "COMPLETED") {
                return new NextResponse("Order already processed", { status: 200 });
            }

            // RACE CONDITION HANDLING: "The Zombie Order"
            // Scenario: Order was CANCELLED by Cron Job because payment took too long, but now Payment arrived.
            // Scenario: Order was CANCELLED by Cron Job because payment took too long, but now Payment arrived.
            if (existingOrder.status === "CANCELLED") {
                logger.warn("Zombie Order Detected: Payment received after cancellation", { orderId });

                // Attempt to Recovery: Check if stock is available to "un-cancel"
                const itemsToRecover = existingOrder.orderItems.map(item => ({
                    productId: item.productId!,
                    quantity: item.quantity
                }));

                try {
                    // We treat this as a fresh sale from an inventory perspective (no reservation exists anymore)

                    await prisma.$transaction(async (tx) => {
                        for (const item of itemsToRecover) {
                            const product = await tx.product.findUnique({ where: { id: item.productId } });
                            if (!product || product.stockQuantity < item.quantity) {
                                throw new Error(`Stock unavailable for recovery: ${item.productId}`);
                            }

                            // Direct Deduction (Skipping Un-Reserve since it was already released)
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stockQuantity: { decrement: item.quantity } }
                            });

                            await tx.inventoryTransaction.create({
                                data: {
                                    productId: item.productId,
                                    type: "SALE",
                                    quantity: -item.quantity,
                                    referenceId: orderId,
                                    reason: "Zombie Recovery: Order Paid after Expiry"
                                }
                            });
                        }

                        // Revive Order
                        await tx.order.update({
                            where: { id: orderId },
                            data: {
                                status: "PAID",
                                paymentStatus: "COMPLETED",
                                payment: {
                                    create: {
                                        amount: session.amount_total || existingOrder.amount,
                                        currency: session.currency || "usd",
                                        provider: "Stripe",
                                        status: "COMPLETED",
                                        transactionId: session.payment_intent as string,
                                    }
                                }
                            }
                        });
                    });

                    // Recovery Successful - Send Email logic below will run naturally

                } catch (recoveryError) {
                    logger.error("Recovery Failed. Issuing Refund.", recoveryError, { orderId });
                    // Stock gone. Must Refund.
                    await stripe.refunds.create({
                        payment_intent: session.payment_intent as string,
                        reason: 'requested_by_customer', // technically inventory issue but close enough
                    });

                    await prisma.order.update({
                        where: { id: orderId },
                        data: { status: "REFUNDED", paymentStatus: "REFUNDED" as any } // Cast for now if enum missing
                    });

                    return new NextResponse("Order expired and out of stock. Refunded.", { status: 200 });
                }
            } else {
                // NORMAL FLOW: Order is CREATED or PENDING
                const items = existingOrder.orderItems.map(item => ({
                    productId: item.productId as string,
                    quantity: item.quantity
                }));

                await InventoryService.confirmSale(orderId, items);

                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: "PAID",
                        paymentStatus: "COMPLETED",
                        payment: {
                            create: {
                                amount: session.amount_total || existingOrder.amount,
                                currency: session.currency || "usd",
                                provider: "Stripe",
                                status: "COMPLETED",
                                transactionId: session.payment_intent as string,
                            }
                        }
                    }
                });
            }

            // 4. Send Confirmation Email (Shared for Normal + Recovery)
            if (process.env.RESEND_API_KEY && existingOrder.User?.email) {
                await resend.emails.send({
                    from: "Aethelon <orders@aethelon.com>",
                    to: existingOrder.User.email,
                    subject: `Order Confirmed #${existingOrder.id.slice(0, 8)}`,
                    html: `
                        <h1>Order Confirmed</h1>
                        <p>Thank you for your purchase, ${existingOrder.User.firstName}.</p>
                        <p>Order ID: ${existingOrder.id}</p>
                        <p>Total: $${(existingOrder.amount / 100).toFixed(2)}</p>
                        <br/>
                        <a href="${process.env.NEXT_PUBLIC_URL}/dashboard/orders">View Order</a>
                    `
                });
            }

        } catch (error) {
            logger.error("Processing Error", error);
            return new NextResponse("Internal Server Error", { status: 500 });
        }
    }

    // HANDLE FAILURE / EXPIRY (Explicit Webhook)
    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
        const orderId = session?.metadata?.orderId;
        if (orderId) {
            const existingOrder = await prisma.order.findUnique({
                where: { id: orderId },
                include: { orderItems: true }
            });

            // Only release if still reserved (CREATED)
            if (existingOrder && existingOrder.status === "CREATED") {
                logger.info("Payment Failed/Expired. Releasing Stock.", { orderId });

                await InventoryService.releaseReservation(orderId, existingOrder.orderItems.map(i => ({
                    productId: i.productId!,
                    quantity: i.quantity
                })));

                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: "CANCELLED",
                        paymentStatus: "FAILED"
                    }
                });
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}

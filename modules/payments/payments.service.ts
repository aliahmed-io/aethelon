import { stripe } from "@/lib/stripe";
import { Order } from "@prisma/client";
import { CartItem } from "@/lib/interfaces";
import Stripe from "stripe";
import logger from "@/lib/logger";
import { PaymentError } from "@/lib/errors";

export class PaymentService {
    /**
     * Creates a Stripe Checkout Session for an order.
     */
    static async createCheckoutSession(order: Order, items: CartItem[], customerEmail?: string): Promise<Stripe.Checkout.Session> {
        try {
            if (!process.env.NEXT_PUBLIC_URL) {
                throw new PaymentError("NEXT_PUBLIC_URL is not configured");
            }

            const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
                (item) => ({
                    price_data: {
                        currency: "usd",
                        unit_amount: item.price,
                        product_data: {
                            name: item.name,
                            images: [item.imageString],
                        },
                    },
                    quantity: item.quantity,
                })
            );

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                line_items: lineItems,
                success_url: process.env.NEXT_PUBLIC_URL + "/checkout/success",
                cancel_url: process.env.NEXT_PUBLIC_URL + "/store/checkout/cancel",
                customer_email: customerEmail,
                metadata: {
                    userId: order.userId || "",
                    orderId: order.id,
                },
            });

            logger.info({ orderId: order.id, sessionId: session.id }, "Stripe Session Created");
            return session;
        } catch (error: unknown) {
            logger.error(error, "Stripe Session Creation Failed");
            const errorMessage = error instanceof Error ? error.message : "Failed to create payment session";
            throw new PaymentError(errorMessage);
        }
    }

    /**
     * Refunds a payment via Stripe.
     */
    static async refund(paymentIntentId: string): Promise<Stripe.Refund> {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                reason: "requested_by_customer"
            });
            logger.info({ paymentIntentId, refundId: refund.id }, "Stripe Refund Created");
            return refund;
        } catch (error: unknown) {
            logger.error({ err: error }, "Stripe Refund Failed");
            throw new PaymentError("Failed to process refund with payment provider");
        }
    }
}

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
            const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
                (item) => ({
                    price_data: {
                        currency: "usd",
                        unit_amount: Math.round(item.price * 100),
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
                cancel_url: process.env.NEXT_PUBLIC_URL + "/checkout/cancel",
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
}

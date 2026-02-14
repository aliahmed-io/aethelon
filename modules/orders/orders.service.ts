import prisma from "@/lib/db";
import { Order, OrderStatus, PaymentStatus } from "@prisma/client";
import { Cart } from "@/lib/interfaces";
import logger from "@/lib/logger";
import { ValidationError, NotFoundError } from "@/lib/errors";

export class OrderService {
    /**
     * Creates a new order in CREATED state from a user's cart.
     */
    static async createFromCart(
        userId: string,
        cart: Cart,
        shippingAddress?: {
            name: string;
            street1: string;
            street2?: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            phone?: string;
        }
    ): Promise<Order> {
        if (!cart.items || cart.items.length === 0) {
            throw new ValidationError("Cannot create order from empty cart");
        }

        const amountCents = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        const order = await prisma.order.create({
            data: {
                userId,
                amount: amountCents, // Amount in cents
                status: "CREATED" as OrderStatus,
                paymentStatus: "PENDING" as PaymentStatus,

                // Shipping Address Snapshot
                shippingName: shippingAddress?.name,
                shippingStreet1: shippingAddress?.street1,
                shippingStreet2: shippingAddress?.street2,
                shippingCity: shippingAddress?.city,
                shippingState: shippingAddress?.state,
                shippingPostalCode: shippingAddress?.postalCode,
                shippingCountry: shippingAddress?.country || "US",
                shippingPhone: shippingAddress?.phone,

                orderItems: {
                    create: cart.items.map((item) => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price, // Store in cents
                        quantity: item.quantity,
                        image: item.imageString,
                    })),
                },
            },
        });

        return order;
    }

    /**
     * Cancels an order.
     * Transitions state to CANCELLED.
     */
    static async cancelOrder(orderId: string): Promise<Order> {
        return this.transitionStatus(orderId, "CANCELLED");
    }

    /**
     * Updates payment status directly.
     * Used by Webhooks (Stripe).
     */
    static async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<Order> {
        return prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: status },
        });
    }

    /**
     * Strict State Machine for Order Transitions.
     */
    static async transitionStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundError(`Order ${orderId}`);

        const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
            CREATED: ["PAYMENT_PENDING", "PAID", "CANCELLED"],
            PAYMENT_PENDING: ["PAID", "CANCELLED", "FAILED"],
            PAID: ["ALLOCATED", "SHIPPED", "CANCELLED"],
            ALLOCATED: ["SHIPPED", "CANCELLED"],
            PARTIALLY_SHIPPED: ["SHIPPED", "CANCELLED"],
            SHIPPED: ["DELIVERED", "REFUNDED"],
            DELIVERED: ["REFUNDED"],
            CANCELLED: [], // Terminal state
            REFUNDED: [], // Terminal state
            FAILED: ["CANCELLED"],
        };

        const allowed = allowedTransitions[order.status];
        if (!allowed || !allowed.includes(newStatus)) {
            // Allow idempotent transitions (transitions to self)
            if (order.status === newStatus) return order;

            logger.warn({ orderId, currentStatus: order.status, targetStatus: newStatus }, "Invalid Order Transition Attempted");
            throw new ValidationError(`Invalid state transition: ${order.status} -> ${newStatus}`);
        }

        return prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
        });
    }
}

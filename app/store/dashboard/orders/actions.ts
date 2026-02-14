"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ShippingService } from "@/modules/shipping/shippo.service";
import { WAREHOUSE_ADDRESS } from "@/lib/config/shipping";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";

export async function fetchShippingRates(orderId: string) {
    try {
        await requireAdmin();

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { User: true }
        });

        if (!order) throw new Error("Order not found");

        const addressTo = {
            name: order.shippingName || "Valued Customer",
            street1: order.shippingStreet1 || "",
            street2: order.shippingStreet2 || undefined,
            city: order.shippingCity || "",
            state: order.shippingState || "",
            zip: order.shippingPostalCode || "",
            country: order.shippingCountry || "US",
            email: order.User?.email || undefined
        };

        const addressFrom = WAREHOUSE_ADDRESS;

        // MVP: 1 Standard Box
        const parcels = [{
            length: 20, width: 20, height: 20, distance_unit: "in" as const,
            weight: 5, mass_unit: "lb" as const
        }];

        const rates = await ShippingService.getRates(addressFrom, addressTo, parcels as any);
        return rates;
    } catch (error: any) {
        logger.error({ err: error, orderId }, "Failed to fetch shipping rates");
        throw error;
    }
}

export async function buyShippingLabel(orderId: string, rateId: string) {
    try {
        await requireAdmin();

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });

        if (!order) throw new Error("Order not found");

        const label = await ShippingService.createLabel(rateId);

        await prisma.shipment.create({
            data: {
                orderId: order.id,
                trackingNumber: label.trackingNumber,
                carrier: label.carrier,
                labelUrl: label.labelUrl,
                status: "PENDING",
                items: {
                    create: order.orderItems.map(i => ({
                        orderItemId: i.id,
                        quantity: i.quantity
                    }))
                }
            }
        });

        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: "SHIPPED",
                fulfillmentStatus: "FULFILLED"
            }
        });

        revalidatePath(`/dashboard/orders/${orderId}`);
        return { success: true, labelUrl: label.labelUrl };
    } catch (error: any) {
        logger.error({ err: error, orderId, rateId }, "Failed to buy shipping label");
        throw error;
    }
}

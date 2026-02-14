"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { ShippingService } from "@/modules/shipping/shippo.service";
import { RETURNS_ADDRESS } from "@/lib/config/shipping";
import { revalidatePath } from "next/cache";

export async function approveReturn(formData: FormData) {
    await requireAdmin();
    const requestId = formData.get("requestId") as string;

    try {
        const request = await prisma.returnRequest.findUnique({
            where: { id: requestId },
            include: { order: true, user: true }
        });

        if (!request) {
            console.error("Return Request not found:", requestId);
            return;
        }

        // 1. Generate Return Label
        // Logic: Swap To/From addresses from original order, or use stored Warehouse address
        const warehouseAddress = RETURNS_ADDRESS;

        const customerAddress = {
            name: request.order.shippingName || request.user.firstName + " " + request.user.lastName,
            street1: request.order.shippingStreet1 || "",
            street2: request.order.shippingStreet2 || undefined,
            city: request.order.shippingCity || "",
            state: request.order.shippingState || "",
            zip: request.order.shippingPostalCode || "",
            country: request.order.shippingCountry || "US",
            email: request.user.email
        };

        // Heuristic Parcel
        const parcel = [{
            length: 12, width: 12, height: 12, distance_unit: "in" as const,
            weight: 2, mass_unit: "lb" as const
        }];

        // Get Rates (Reverse: From Customer TO Warehouse)
        const rates = await ShippingService.getRates(customerAddress, warehouseAddress, parcel);
        // In reality, return labels are often "Pay on Scan" or pre-generated via specific Return API
        // For standard Shippo/EasyPost, we can just buy a label with From=Customer, To=Warehouse.

        if (!rates || rates.length === 0) throw new Error("No return rates available");

        const bestRate = rates[0]; // Simplest rate
        const label = await ShippingService.createLabel(bestRate.objectId);

        // 2. Update Request
        await prisma.returnRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                returnLabelUrl: label.labelUrl,
                adminNotes: "Auto-approved via Dashboard"
            }
        });

        revalidatePath("/dashboard/returns");
    } catch (error) {
        console.error("Approve Return Error:", error);
    }
}

export async function rejectReturn(formData: FormData) {
    await requireAdmin();
    const requestId = formData.get("requestId") as string;

    try {
        await prisma.returnRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        });

        revalidatePath("/dashboard/returns");
    } catch (error) {
        console.error("Reject Return Error:", error);
    }
}

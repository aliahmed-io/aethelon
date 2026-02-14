import { NextResponse } from "next/server";
import { ShippingService } from "@/modules/shipping/shippo.service";
import { z } from "zod";
import logger from "@/lib/logger";
import { WAREHOUSE_ADDRESS } from "@/lib/config/shipping";

const rateSchema = z.object({
    address: z.object({
        name: z.string(),
        street1: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string().default("US"),
        email: z.string().email(),
    }),
    items: z.array(z.object({
        id: z.string(),
        quantity: z.number(),
    }))
});

import { rateLimit } from "@/lib/rate-limit";

// ...

export async function POST(req: Request) {
    // Rate Limit: 10 requests per minute by IP
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await rateLimit(`shipping-${ip}`, 10, "60 s");

    if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { address, items } = rateSchema.parse(body);

        // Simple Heuristic: 1 Item = 1 Parcel (20x20x20, 10lb)
        // In a real app, we'd fetch dimensions from DB
        const parcels = items.map(() => ({
            length: 20,
            width: 20,
            height: 20,
            distance_unit: "in" as const,
            weight: 10,
            mass_unit: "lb" as const,
        }));

        const addressFrom = WAREHOUSE_ADDRESS;

        const rates = await ShippingService.getRates(addressFrom, address, parcels);

        return NextResponse.json({ rates });
    } catch (error) {
        logger.error({ error }, "Shipping Rate Calculation Failed");
        return NextResponse.json(
            { error: "Failed to calculate shipping rates" },
            { status: 500 }
        );
    }
}

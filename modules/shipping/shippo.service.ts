import { Shippo, type SDKOptions } from "shippo";
import logger from "@/lib/logger";

const SHIPPO_API_TOKEN = process.env.SHIPPO_API_TOKEN;

if (!SHIPPO_API_TOKEN) {
    logger.warn("SHIPPO_API_TOKEN is missing. Shipping features will not work.");
}

const shippo = new Shippo({ token: SHIPPO_API_TOKEN ?? "" } as unknown as SDKOptions);

export interface ShippingAddress {
    name: string;
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
}

export interface ParcelDimensions {
    length: number;
    width: number;
    height: number;
    distance_unit: "in" | "cm";
    weight: number;
    mass_unit: "lb" | "kg";
}

type ShippoRate = {
    objectId: string;
    amount: string;
    provider?: string;
    servicelevel?: { name?: string };
    estimatedDays?: number | null;
};

export class ShippingService {
    /**
     * Get live shipping rates for a shipment.
     */
    static async getRates(
        addressFrom: ShippingAddress,
        addressTo: ShippingAddress,
        parcels: ParcelDimensions[]
    ): Promise<ShippoRate[]> {
        if (!SHIPPO_API_TOKEN) {
            throw new Error("Shipping is not configured.");
        }
        try {
            const shipment = await (shippo as unknown as { shipments: { create: (input: unknown) => Promise<unknown> } }).shipments.create({
                address_from: addressFrom,
                address_to: addressTo,
                parcels,
                async: false,
            });

            return ((shipment as { rates?: ShippoRate[] }).rates ?? []);
        } catch (error) {
            logger.error({ err: error }, "Failed to fetch shipping rates");
            throw new Error("Unable to calculate shipping rates at this time.");
        }
    }

    /**
     * Create a shipping label from a rate ID.
     */
    static async createLabel(rateId: string) {
        if (!SHIPPO_API_TOKEN) {
            throw new Error("Shipping is not configured.");
        }
        try {
            const transaction = await shippo.transactions.create({
                rate: rateId,
                labelFileType: "PDF",
                async: false,
            });

            if (transaction.status === "ERROR") {
                throw new Error("Transaction Error: " + JSON.stringify(transaction.messages));
            }

            return {
                trackingNumber: transaction.trackingNumber,
                labelUrl: transaction.labelUrl,
                carrier: typeof transaction.rate !== "string" ? transaction.rate?.provider : "Unknown",
            };
        } catch (error) {
            logger.error({ err: error, rateId }, "Failed to create shipping label");
            throw error;
        }
    }
}

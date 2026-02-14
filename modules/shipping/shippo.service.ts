import { Shippo } from "shippo";
import logger from "@/lib/logger";

const SHIPPO_API_TOKEN = process.env.SHIPPO_API_TOKEN;

if (!SHIPPO_API_TOKEN) {
    logger.warn("SHIPPO_API_TOKEN is missing. Shipping features will not work.");
}

const shippo = new Shippo({ apiKeyHeader: SHIPPO_API_TOKEN! });

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

export class ShippingService {
    /**
     * Get live shipping rates for a shipment.
     */
    static async getRates(
        addressFrom: ShippingAddress,
        addressTo: ShippingAddress,
        parcels: ParcelDimensions[]
    ) {
        try {
            const shipment = await shippo.shipments.create({
                addressFrom,
                addressTo,
                parcels,
                async: false,
            });

            return shipment.rates;
        } catch (error) {
            logger.error({ error }, "Failed to fetch shipping rates");
            throw new Error("Unable to calculate shipping rates at this time.");
        }
    }

    /**
     * Create a shipping label from a rate ID.
     */
    static async createLabel(rateId: string) {
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
                carrier: transaction.rate.provider,
            };
        } catch (error) {
            logger.error({ error, rateId }, "Failed to create shipping label");
            throw error;
        }
    }
}

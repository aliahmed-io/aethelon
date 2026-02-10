import { Shippo } from "shippo";

const apiKeyHeader = process.env.SHIPPO_API_KEY;

if (!apiKeyHeader) {
    console.warn("⚠️ SHIPPO_API_KEY is missing in environment variables. Shipping rates/labels will fail.");
}

const shippo = apiKeyHeader
    ? new Shippo({
        apiKeyHeader,
    })
    : null;

export async function getShippingRates(
    addressTo: {
        name: string;
        street1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        email?: string;
    },
    addressFrom: {
        name: string;
        street1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        email?: string;
    } = {
            name: "Aethelona Store",
            street1: "123 Fashion St",
            city: "San Francisco",
            state: "CA",
            zip: "94105",
            country: "US",
            email: "support@aethelona.com",
        },
    totalWeight: number = 2
) {
    try {
        if (!shippo) {
            throw new Error("Shippo is not configured (missing SHIPPO_API_KEY)");
        }

        const parcel = {
            length: "10",
            width: "6",
            height: "4",
            distanceUnit: "in",
            weight: totalWeight.toString(),
            massUnit: "lb",
        };
        const shipment = await shippo.shipments.create({
            addressFrom: addressFrom,
            addressTo: addressTo,
            parcels: [parcel as any],
            async: false,
        });

        return shipment.rates;
    } catch (error) {
        console.error("Error fetching rates:", error);
        throw new Error("Failed to fetch shipping rates");
    }
}

export async function purchaseLabel(rateId: string) {
    try {
        if (!shippo) {
            throw new Error("Shippo is not configured (missing SHIPPO_API_KEY)");
        }

        const transaction = await shippo.transactions.create({
            rate: rateId,
            labelFileType: "PDF",
            async: false,
        });

        return transaction;
    } catch (error) {
        console.error("Error purchasing label:", error);
        throw new Error("Failed to purchase shipping label");
    }
}

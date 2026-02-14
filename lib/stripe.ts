import Stripe from "stripe";
import logger from "@/lib/logger";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("FATAL: STRIPE_SECRET_KEY is missing in production environment.");
    }
    logger.warn("⚠️ STRIPE_SECRET_KEY is missing. Stripe calls will fail.");
}

export const stripe = new Stripe(stripeKey || "sk_test_mock_key", {
    apiVersion: "2026-01-28.clover" as any, // Using the version explicitly requested by the type definition
    typescript: true,
});

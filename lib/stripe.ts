import Stripe from "stripe";
import logger from "@/lib/logger";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    logger.warn("⚠️ STRIPE_SECRET_KEY is missing. Stripe calls will fail.");
}

export const stripe = new Stripe(stripeKey || "sk_test_mock_key", {
    apiVersion: "2026-01-28.clover" as any, // Using the version explicitly requested by the type definition
    typescript: true,
});

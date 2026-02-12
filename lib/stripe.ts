import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

import logger from "@/lib/logger";

if (!stripeKey) {
    logger.warn("⚠️ STRIPE_SECRET_KEY is missing in environment variables. Stripe calls will fail.");
}

export const stripe = new Stripe(stripeKey || "sk_missing", {
    apiVersion: "2025-11-17.clover",
    typescript: true,
});

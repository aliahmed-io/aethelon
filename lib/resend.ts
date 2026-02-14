import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export function getResendFromEmail() {
    const from = process.env.RESEND_FROM;
    if (from) return from;
    if (process.env.NODE_ENV !== "production") {
        return "Aethelona <onboarding@resend.dev>";
    }
    throw new Error("Missing RESEND_FROM in environment variables.");
}

import logger from "@/lib/logger";

if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("FATAL: RESEND_API_KEY is missing in production environment.");
    }
    logger.warn("⚠️ RESEND_API_KEY is missing. Email sending will fail.");
}

export const resend = new Resend(apiKey || "re_test_mock_key");

import { withRetry } from "@/lib/retry";
import { CreateEmailOptions } from "resend";

export async function sendEmailSafe(payload: CreateEmailOptions) {
    if (!apiKey) {
        logger.warn({ to: payload.to }, "Skipping email: Missing API Key");
        return;
    }

    try {
        await withRetry(async () => {
            const { error, data } = await resend.emails.send(payload);
            if (error) {
                throw new Error(`Resend Error: ${error.message}`);
            }
            return data;
        }, { maxRetries: 3, baseDelayMs: 1000 });

        logger.info({ to: payload.to, subject: payload.subject }, "Email sent successfully");
    } catch (error) {
        logger.error({ err: error }, "Failed to send email after retries");
        // We absorb the error to prevent crashing the caller (e.g., Webhook)
        // The AlertService (if wired up to logger.error) would pick this up.
    }
}

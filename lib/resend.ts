import { Resend } from "resend";
import logger from "@/lib/logger";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    logger.warn("⚠️ RESEND_API_KEY is missing. Email sending will fail.");
}

export function getResendFromEmail() {
    const from = process.env.RESEND_FROM;
    if (from) return from;

    // In production build or missing env, we use a fallback to prevent crash
    if (process.env.NODE_ENV !== "production") {
        return "Aethelona <onboarding@resend.dev>";
    }

    logger.warn("Missing RESEND_FROM in environment variables. Using fallback.");
    return "Aethelon <no-reply@aethelon.com>";
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

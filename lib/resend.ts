import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export function getResendFromEmail() {
    const from = process.env.RESEND_FROM;
    if (from) return from;
    if (process.env.NODE_ENV !== "production") {
        return "Novexa <onboarding@resend.dev>";
    }
    throw new Error("Missing RESEND_FROM in environment variables.");
}

if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is missing in environment variables. Email sending will fail.");
}

export const resend = new Resend(apiKey || "re_missing_key");

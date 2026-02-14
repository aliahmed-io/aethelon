import logger from "@/lib/logger";

export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";

export class AlertService {
    /**
     * Send an alert to Admins (Logs + Future Email/Slack)
     */
    static async send(message: string, level: AlertLevel = "INFO", context?: Record<string, unknown>) {
        const payload = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...context
        };

        // 1. Structured Log (Already captured by Datadog/Axiom if connected)
        if (level === "CRITICAL") {
            logger.error(payload, `[ALERT:CRITICAL] ${message}`);
        } else if (level === "WARNING") {
            logger.warn(payload, `[ALERT:WARNING] ${message}`);
        } else {
            logger.info(payload, `[ALERT:INFO] ${message}`);
        }

        // 2. Dispatch to External Channel (Email/Slack)
        // TODO: Integrate Slack Webhook or Resend Email here
        // 2. Dispatch to External Channel (Email)
        if (level === "CRITICAL") {
            try {
                // Dynamically import to avoid circular dep if alert is used in resend
                const { sendEmailSafe } = await import("@/lib/resend");
                const adminEmail = process.env.ADMIN_EMAIL || "admin@aethelon.com"; // Fallback or env

                await sendEmailSafe({
                    from: "Aethelon Alerts <alerts@aethelon.com>",
                    to: adminEmail,
                    subject: `🚨 CRITICAL ALERT: ${message}`,
                    html: `
                        <h1>Critical System Alert</h1>
                        <p><strong>Message:</strong> ${message}</p>
                        <p><strong>Timestamp:</strong> ${payload.timestamp}</p>
                        <pre>${JSON.stringify(payload, null, 2)}</pre>
                    `
                });
            } catch (err) {
                console.error("Failed to dispatch critical alert email", err);
            }
        }
    }
}

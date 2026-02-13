import logger from "@/lib/logger";

export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";

export class AlertService {
    /**
     * Send an alert to Admins (Logs + Future Email/Slack)
     */
    static async send(message: string, level: AlertLevel = "INFO", context?: Record<string, any>) {
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
        if (level === "CRITICAL") {
            // Mock dispatch
            // await fetch(SLACK_WEBHOOK, { body: JSON.stringify({ text: `🚨 ${message}` }) });
            console.error(">>> [MOCK EMAIL SENT TO ADMIN] <<<", message);
        }
    }
}

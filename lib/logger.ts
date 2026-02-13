import pino from "pino";

const logLevel = process.env.LOG_LEVEL || "info";

const logger = pino({
    level: logLevel,
    transport:
        process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            }
            : undefined,
    base: {
        env: process.env.NODE_ENV,
    },
    redact: ["password", "token", "key", "authorization"], // Security: Mask sensitive fields
});

export default logger;

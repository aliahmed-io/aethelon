/**
 * Structured Logger for Aethelon
 * Replaces console.log with JSON-structured output for observability.
 * Mimics Pino API for future drop-in replacement.
 */

const LOG_LEVELS = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

interface LogContext {
    requestId?: string;
    userId?: string;
    source?: string;
    [key: string]: any;
}

const getTimestamp = () => new Date().toISOString();

const formatLog = (level: LogLevel, message: string, context?: LogContext, error?: unknown) => {
    const logEntry = {
        level,
        time: getTimestamp(),
        msg: message,
        ...context,
    };

    if (error instanceof Error) {
        Object.assign(logEntry, {
            err: {
                message: error.message,
                name: error.name,
                stack: error.stack,
            },
        });
    } else if (error) {
        Object.assign(logEntry, { err: error });
    }

    return JSON.stringify(logEntry);
};

const logger = {
    debug: (message: string, context?: LogContext) => {
        if (process.env.NODE_ENV === "development") {
            console.debug(formatLog("debug", message, context));
        }
    },

    info: (message: string, context?: LogContext) => {
        console.log(formatLog("info", message, context));
    },

    warn: (message: string, context?: LogContext) => {
        console.warn(formatLog("warn", message, context));
    },

    error: (message: string, error?: unknown, context?: LogContext) => {
        console.error(formatLog("error", message, context, error));
    },
};

export default logger;

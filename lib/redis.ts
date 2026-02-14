import { Redis } from 'ioredis';

const logger = require("@/lib/logger").default;

const getRedis = () => {
    if (process.env.REDIS_URL) {
        const client = new Redis(process.env.REDIS_URL);

        client.on('error', (err) => {
            logger.error({ err }, "Redis Connection Error");
        });
        return client;
    }
    // Return undefined if no URL is configured, effectively "disabling" Redis functions
    // The app checks `if (redis)` before using it.
    return undefined;
};

export const redis = getRedis();
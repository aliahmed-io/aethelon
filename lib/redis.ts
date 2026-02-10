import { Redis } from 'ioredis';

const getRedis = () => {
    if (process.env.REDIS_URL) {
        const client = new Redis(process.env.REDIS_URL);
        // Prevent crashing on connection errors
        client.on('error', (_err) => {
            // Silently handle error or log only once
            // console.warn("Redis Error:", err.message); 
        });
        return client;
    }
    // Return undefined if no URL is configured, effectively "disabling" Redis functions
    // The app checks `if (redis)` before using it.
    return undefined;
};

export const redis = getRedis();
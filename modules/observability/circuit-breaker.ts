import { redis } from "@/lib/redis";
import logger from "@/lib/logger";
import { AlertService } from "./alert.service";

type CircuitBreakerOptions = {
    failureThreshold: number;
    recoveryTimeout: number; // in ms
};

enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN",
}

export class CircuitBreaker {
    private readonly name: string;
    private readonly failureThreshold: number;
    private readonly recoveryTimeout: number;

    // In-memory fallback
    private memoryState: CircuitState = CircuitState.CLOSED;
    private memoryFailures = 0;
    private memoryLastFailure = 0;

    constructor(name: string, options: CircuitBreakerOptions) {
        this.name = name;
        this.failureThreshold = options.failureThreshold;
        this.recoveryTimeout = options.recoveryTimeout;
    }

    private getKey(suffix: string) {
        return `circuit:${this.name}:${suffix}`;
    }

    private async getState(): Promise<CircuitState> {
        if (!redis) return this.memoryState;
        const state = await redis.get(this.getKey("state"));
        return (state as CircuitState) || CircuitState.CLOSED;
    }

    private async setState(state: CircuitState) {
        if (!redis) {
            this.memoryState = state;
            return;
        }
        await redis.set(this.getKey("state"), state);
    }

    private async getFailures(): Promise<number> {
        if (!redis) return this.memoryFailures;
        const count = await redis.get(this.getKey("failures"));
        return Number(count) || 0;
    }

    private async incrementFailures(): Promise<number> {
        if (!redis) {
            this.memoryLocalFailure();
            return this.memoryFailures;
        }
        const count = await redis.incr(this.getKey("failures"));
        // Set expiry on failure key to auto-reset if no failures occur for a while (2x recovery time)
        await redis.expire(this.getKey("failures"), (this.recoveryTimeout * 2) / 1000);
        return count;
    }

    private async resetFailures() {
        if (!redis) {
            this.memoryFailures = 0;
            return;
        }
        await redis.del(this.getKey("failures"));
    }

    private memoryLocalFailure() {
        this.memoryFailures++;
        this.memoryLastFailure = Date.now();
    }

    private async canRequest(): Promise<boolean> {
        const state = await this.getState();

        if (state === CircuitState.CLOSED) return true;

        if (state === CircuitState.HALF_OPEN) return true; // Allow 1 request to test

        if (state === CircuitState.OPEN) {
            // Check if recovery timeout has passed
            const lastFailureStr = redis ? await redis.get(this.getKey("last_failure")) : this.memoryLastFailure;
            const lastFailure = Number(lastFailureStr) || 0;

            if (Date.now() - lastFailure > this.recoveryTimeout) {
                await this.setState(CircuitState.HALF_OPEN);
                logger.info(`CircuitBreaker [${this.name}] entering HALF_OPEN state (Probing)`);
                return true;
            }
            return false;
        }

        return true;
    }

    public async execute<T>(action: () => Promise<T>): Promise<T> {
        if (!(await this.canRequest())) {
            logger.warn(`CircuitBreaker [${this.name}] is OPEN. Blocking request.`);
            throw new Error(`Service ${this.name} is currently unavailable (Circuit Open).`);
        }

        try {
            const result = await action();
            await this.onSuccess();
            return result;
        } catch (error) {
            await this.onFailure();
            throw error;
        }
    }

    private async onSuccess() {
        const state = await this.getState();
        if (state === CircuitState.HALF_OPEN) {
            await this.setState(CircuitState.CLOSED);
            await this.resetFailures();
            logger.info(`CircuitBreaker [${this.name}] closed (Recovered)`);
            AlertService.send(`Service ${this.name} has recovered.`, "INFO");
        } else if (state === CircuitState.CLOSED) {
            // Optional: reset failures on success to be strict, or rely on TTL
            // await this.resetFailures(); 
        }
    }

    private async onFailure() {
        const count = await this.incrementFailures();

        if (redis) {
            await redis.set(this.getKey("last_failure"), Date.now());
        }

        const state = await this.getState();
        if (state === CircuitState.HALF_OPEN || count >= this.failureThreshold) {
            if (state !== CircuitState.OPEN) {
                await this.setState(CircuitState.OPEN);
                const msg = `CircuitBreaker [${this.name}] OPENED after ${count} failures.`;
                logger.error(msg);
                AlertService.send(msg, "CRITICAL", { failures: count });
            }
        }
    }
}

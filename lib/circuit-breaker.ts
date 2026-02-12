import logger from "@/lib/logger";

type CircuitBreakerOptions = {
    failureThreshold: number;
    recoveryTimeout: number; // in ms
};

enum CircuitState {
    CLOSED,
    OPEN,
    HALF_OPEN,
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private lastFailureTime = 0;
    private readonly failureThreshold: number;
    private readonly recoveryTimeout: number;
    private readonly name: string;

    constructor(name: string, options: CircuitBreakerOptions) {
        this.name = name;
        this.failureThreshold = options.failureThreshold;
        this.recoveryTimeout = options.recoveryTimeout;
    }

    public async execute<T>(action: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = CircuitState.HALF_OPEN;
                logger.info(`CircuitBreaker [${this.name}] entering HALF_OPEN state`);
            } else {
                logger.warn(`CircuitBreaker [${this.name}] is OPEN. Blocking request.`);
                throw new Error(`Service ${this.name} is currently unavailable.`);
            }
        }

        // CHAOS MODE: Simulate random failures
        if (process.env.CHAOS_MODE === "true") {
            const random = Math.random();
            if (random < 0.1) { // 10% chance of error
                logger.warn(`CircuitBreaker [${this.name}] CHAOS_MODE: Simulating failure`);
                throw new Error(`[CHAOS] Service ${this.name} failure simulated.`);
            }
            if (random < 0.2) { // 10% chance of latency (total 20% chaos)
                logger.warn(`CircuitBreaker [${this.name}] CHAOS_MODE: Simulating latency`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        try {
            const result = await action();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.CLOSED;
            this.failureCount = 0;
            logger.info(`CircuitBreaker [${this.name}] closed (recovered)`);
        } else if (this.state === CircuitState.CLOSED) {
            this.failureCount = 0;
        }
    }

    private onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
            logger.error(`CircuitBreaker [${this.name}] opened due to failures`);
        }
    }
}

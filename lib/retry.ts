/**
 * API Retry Utility
 * Automatically retries failed fetch requests with exponential backoff
 */

interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    retryOn?: (response: Response) => boolean;
}

import logger from "@/lib/logger";

const defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    retryOn: (res) => res.status >= 500 || res.status === 429
};

/**
 * Fetch with automatic retry on failure
 */
export async function fetchWithRetry(
    url: string,
    options?: RequestInit,
    retryOptions?: RetryOptions
): Promise<Response> {
    const config = { ...defaultOptions, ...retryOptions };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            // Check if we should retry based on response
            if (config.retryOn(response) && attempt < config.maxRetries) {
                const delay = Math.min(
                    config.baseDelayMs * Math.pow(2, attempt),
                    config.maxDelayMs
                );
                logger.warn(`[Retry] Attempt ${attempt + 1}/${config.maxRetries} for ${url}. Waiting ${delay}ms...`);
                await sleep(delay);
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;

            if (attempt < config.maxRetries) {
                const delay = Math.min(
                    config.baseDelayMs * Math.pow(2, attempt),
                    config.maxDelayMs
                );
                logger.warn(`[Retry] Network error on attempt ${attempt + 1}/${config.maxRetries}. Waiting ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    throw new Error(`Failed after ${config.maxRetries} retries: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Wrapper for JSON API calls with retry
 */
export async function fetchJsonWithRetry<T>(
    url: string,
    options?: RequestInit,
    retryOptions?: RetryOptions
): Promise<T> {
    const response = await fetchWithRetry(url, options, retryOptions);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a retry wrapper for any async function
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options?: Omit<RetryOptions, 'retryOn'>
): Promise<T> {
    const config = {
        maxRetries: options?.maxRetries ?? 3,
        baseDelayMs: options?.baseDelayMs ?? 1000,
        maxDelayMs: options?.maxDelayMs ?? 10000
    };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < config.maxRetries) {
                const delay = Math.min(
                    config.baseDelayMs * Math.pow(2, attempt),
                    config.maxDelayMs
                );
                logger.warn(`[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    throw lastError || new Error('Unknown error after retries');
}

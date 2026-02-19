import prisma from "@/lib/db";
import logger from "@/lib/logger";

export interface TaxCalculation {
    taxCents: number;
    rate: number;
    name: string;
    inclusive: boolean;
}

/**
 * Tax Service
 * Handles tax calculation based on country/region tax rules.
 */
export class TaxService {
    /**
     * Finds the most specific tax rule matching the given country and optional region.
     * Looks first for a country+region match, then falls back to country-only.
     */
    static async getTaxForAddress(
        country: string,
        region?: string
    ): Promise<TaxCalculation | null> {
        try {
            // Try specific region match first
            if (region) {
                const regionRule = await prisma.taxRule.findFirst({
                    where: {
                        country: country.toUpperCase(),
                        region: region.toUpperCase(),
                        active: true,
                    },
                });

                if (regionRule) {
                    return {
                        taxCents: 0, // Will be calculated by caller
                        rate: regionRule.rate,
                        name: regionRule.name,
                        inclusive: regionRule.inclusive,
                    };
                }
            }

            // Fallback to country-only rule
            const countryRule = await prisma.taxRule.findFirst({
                where: {
                    country: country.toUpperCase(),
                    region: null,
                    active: true,
                },
            });

            if (countryRule) {
                return {
                    taxCents: 0,
                    rate: countryRule.rate,
                    name: countryRule.name,
                    inclusive: countryRule.inclusive,
                };
            }

            return null;
        } catch (error) {
            logger.error({ error, country, region }, "Tax Lookup Failed");
            return null;
        }
    }

    /**
     * Calculates the tax amount in cents.
     *
     * - **Exclusive** (US/CA/AU): Tax is added ON TOP of the subtotal.
     *   Subtotal $100 + 10% tax = $110 total, $10 tax.
     *
     * - **Inclusive** (EU/UK): Tax is already included in the price.
     *   Subtotal $100 at 20% VAT = $100 total, $16.67 VAT portion.
     */
    static calculateTax(
        subtotalCents: number,
        rate: number,
        inclusive: boolean
    ): { taxCents: number; totalCents: number } {
        if (rate <= 0) {
            return { taxCents: 0, totalCents: subtotalCents };
        }

        if (inclusive) {
            // Tax is already included in the price
            // For 20% inclusive: tax = price - (price / 1.20)
            const taxCents = Math.round(
                subtotalCents - subtotalCents / (1 + rate)
            );
            return { taxCents, totalCents: subtotalCents };
        }

        // Tax is added on top
        const taxCents = Math.round(subtotalCents * rate);
        return {
            taxCents,
            totalCents: subtotalCents + taxCents,
        };
    }
}

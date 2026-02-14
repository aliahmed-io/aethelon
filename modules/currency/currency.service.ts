import { cookies } from "next/headers";

export const SUPPORTED_CURRENCIES = {
    USD: { symbol: "$", rate: 1, locale: "en-US" },
    EUR: { symbol: "€", rate: 0.92, locale: "de-DE" },
    GBP: { symbol: "£", rate: 0.79, locale: "en-GB" },
    JPY: { symbol: "¥", rate: 150.5, locale: "ja-JP" },
    CAD: { symbol: "CA$", rate: 1.35, locale: "en-CA" },
};

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export class CurrencyService {
    static async getCurrency(): Promise<CurrencyCode> {
        const cookieStore = await cookies();
        const currency = cookieStore.get("NEXT_CURRENCY")?.value as CurrencyCode;
        return SUPPORTED_CURRENCIES[currency] ? currency : "USD";
    }

    static convert(amountInCents: number, currency: CurrencyCode): number {
        const rate = SUPPORTED_CURRENCIES[currency].rate;
        return Math.round(amountInCents * rate);
    }

    static format(amountInCents: number, currency: CurrencyCode = "USD"): string {
        const config = SUPPORTED_CURRENCIES[currency];
        const converted = this.convert(amountInCents, currency);

        return new Intl.NumberFormat(config.locale, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: currency === "JPY" ? 0 : 2
        }).format(converted / 100);
    }
}

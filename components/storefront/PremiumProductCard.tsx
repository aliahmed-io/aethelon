"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PremiumProductCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    discountPercentage?: number;
    brand?: string | null;
  };
  priority?: boolean;
}

/**
 * Premium collection card: no wishlist (stock not guaranteed), no ratings.
 * Keeps store typography and color palette.
 */
export function PremiumProductCard({ item, priority = false }: PremiumProductCardProps) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    const match = document.cookie.match(/(^| )NEXT_CURRENCY=([^;]+)/);
    const curr = match ? match[2] : "USD";
    setCurrency(curr);

    const rates: Record<string, { rate: number; locale: string }> = {
      USD: { rate: 1, locale: "en-US" },
      EUR: { rate: 0.92, locale: "de-DE" },
      GBP: { rate: 0.79, locale: "en-GB" },
      JPY: { rate: 150.5, locale: "ja-JP" },
      CAD: { rate: 1.35, locale: "en-CA" },
    };

    if (rates[curr]) {
      setRate(rates[curr].rate);
      setLocale(rates[curr].locale);
    }
  }, []);

  const discountedPriceCents =
    (item.discountPercentage ?? 0) > 0
      ? Math.round(item.price * (1 - (item.discountPercentage ?? 0) / 100))
      : item.price;

  const displayPrice = (cents: number) => {
    const value = (cents * rate) / 100;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(value);
  };

  return (
    <Link
      href={`/shop/${item.id}`}
      className="group block"
      data-testid="premium-product-card"
    >
      <div className="transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.02]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted border border-border">
          <Image
            src={item.images[0] ?? ""}
            alt={item.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 50vw"
            className="object-contain p-6 transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
            priority={priority}
          />
          {((item.discountPercentage ?? 0) > 0) && (
            <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-accent border border-accent/30 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-sm">
              —{item.discountPercentage}%
            </span>
          )}
        </div>

        <div className="pt-5 pb-2 space-y-1.5 border-b border-transparent group-hover:border-border/50 transition-colors">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {item.brand || "Aethelon"}
          </p>
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors tracking-wide">
            {item.name}
          </h3>
          <p className="text-sm font-light text-foreground pt-1">
            {displayPrice(discountedPriceCents)}
            {(item.discountPercentage ?? 0) > 0 && (
              <span className="text-xs text-muted-foreground line-through ml-2">
                {displayPrice(item.price)}
              </span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function LoadingPremiumProductCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-sm bg-muted border border-border" />
      <div className="pt-5 pb-2 space-y-2">
        <div className="h-2.5 bg-muted rounded w-20" />
        <div className="h-3.5 bg-muted rounded w-4/5" />
        <div className="h-3.5 bg-muted rounded w-24" />
      </div>
    </div>
  );
}

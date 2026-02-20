"use client";

import { WishlistButton } from "./WishlistButton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface iAppProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    discountPercentage: number;
    modelUrl?: string | null;
  };
  priority?: boolean;
}

export function ProductCard({ item, priority = false }: iAppProps) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    const match = document.cookie.match(/(^| )NEXT_CURRENCY=([^;]+)/);
    const curr = match ? match[2] : "USD";
    setCurrency(curr);

    const rates: Record<string, { rate: number, locale: string }> = {
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

  const discountedPriceCents = item.discountPercentage > 0
    ? Math.round(item.price * (1 - item.discountPercentage / 100))
    : item.price;

  const formatPrice = (cents: number) => {
    const value = (cents * rate) / 100;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2
    }).format(value);
  };

  return (
    <Link
      href={`/shop/${item.id}`}
      className="group block"
      data-testid="product-card"
    >
      <div className="transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03]">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary">
          <Image
            src={item.images[0]}
            alt={item.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 50vw"
            className="object-contain p-4 transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
            priority={priority}
          />

          {/* Discount Badge */}
          {item.discountPercentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-600 text-white hover:bg-red-700 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
              -{item.discountPercentage}%
            </Badge>
          )}

          {/* Wishlist */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="bg-white rounded-full p-2 shadow-md border border-neutral-200 hover:bg-neutral-50 transition-colors">
              <WishlistButton productId={item.id} />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-4 pb-2 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Aethelon
          </p>
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-foreground/80 transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(discountedPriceCents)}
            </span>
            {item.discountPercentage > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(item.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LoadingProductCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-sm bg-secondary" />
      <div className="pt-4 pb-2 space-y-2">
        <div className="h-2.5 bg-muted rounded w-16" />
        <div className="h-3.5 bg-muted rounded w-3/4" />
        <div className="h-3.5 bg-muted rounded w-1/4" />
      </div>
    </div>
  );
}
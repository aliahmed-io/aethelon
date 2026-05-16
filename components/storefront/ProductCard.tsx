"use client";

import { WishlistButton } from "./WishlistButton";
import { Badge } from "@/components/ui/badge";
import { Cuboid } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Tilt } from "@/components/ui/Tilt";

interface iAppProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    discountPercentage: number;
    modelUrl?: string | null;
    variants?: { colorHex: string }[];
  };
  priority?: boolean;
}

export function ProductCard({ item, priority = false }: iAppProps) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    const handleCurrencyChange = (e?: Event) => {
      let curr = "USD";
      if (e && 'detail' in e && typeof e.detail === 'string') {
        curr = e.detail;
      } else {
        const match = document.cookie.match(/(^| )NEXT_CURRENCY=([^;]+)/);
        curr = match ? match[2] : "USD";
      }
      setCurrency(curr);
      const rates: Record<string, { rate: number; locale: string }> = {
        USD: { rate: 1, locale: "en-US" },
        EUR: { rate: 0.92, locale: "de-DE" },
        GBP: { rate: 0.79, locale: "en-GB" },
        JPY: { rate: 150.5, locale: "ja-JP" },
        CAD: { rate: 1.35, locale: "en-CA" },
      };
      if (rates[curr]) { setRate(rates[curr].rate); setLocale(rates[curr].locale); }
    };

    handleCurrencyChange();
    window.addEventListener("currency_changed", handleCurrencyChange);
    return () => window.removeEventListener("currency_changed", handleCurrencyChange);
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
        <Tilt>
          <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary">
            <Image
              src={item.images[0]}
              alt={item.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 50vw"
              className="object-contain p-4 transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
              priority={priority}
              quality={70}
            />

            {/* Discount Badge */}
            {item.discountPercentage > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-600 text-white hover:bg-red-700 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                -{item.discountPercentage}%
              </Badge>
            )}

            {/* 3D Model Available Badge */}
            {item.modelUrl && (
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-1 rounded-sm flex items-center gap-1.5 shadow-sm border border-white/10 pointer-events-none">
                <Cuboid className="w-3 h-3" strokeWidth={1.5} />
                <span>3D</span>
              </div>
            )}

            {/* Wishlist */}
            <div
              className="absolute top-3 right-3 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-30"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-2 shadow-md border border-neutral-200 hover:bg-white transition-colors">
                <WishlistButton productId={item.id} />
              </div>
            </div>
          </div>
        </Tilt>

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

          {/* Color Variant Indicators */}
          {item.variants && item.variants.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1.5">
              {item.variants.slice(0, 4).map((variant, idx) => (
                <div
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full border border-border/50 shadow-sm"
                  style={{ backgroundColor: variant.colorHex }}
                  aria-label={`Color variant: ${variant.colorHex}`}
                />
              ))}
              {item.variants.length > 4 && (
                <span className="text-[9px] text-muted-foreground ml-0.5">+{item.variants.length - 4}</span>
              )}
            </div>
          )}
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
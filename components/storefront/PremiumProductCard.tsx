"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Cuboid } from "lucide-react";

interface PremiumProductCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    discountPercentage?: number;
    brand?: string | null;
    tags?: string[];
    modelUrl?: string | null;
  };
  priority?: boolean;
  index?: number;
}

/** Vault gallery card — dark editorial portrait, links to /vault/[id] */
export function PremiumProductCard({ item, priority = false, index = 0 }: PremiumProductCardProps) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);
  const [locale, setLocale] = useState("en-US");
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (!item.images || item.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIdx(prev => (prev + 1) % item.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [item.images]);

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

  const displayPrice = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format((cents * rate) / 100);

  // Vault items are inherently limited edition
  const isLimited = true;
  const edition = item.tags?.find((t) => /^\d+\s*\/\s*\d+$/.test(t)); // e.g. "01 / 24"

  return (
    <Link
      href={`/vault/${item.id}`}
      className="group block"
      data-testid="vault-product-card"
      style={{
        animation: `vault-reveal 0.6s ease-out ${index * 90}ms both`,
      }}
    >
      {/* Card wrapper */}
      <div
        className="relative overflow-hidden transition-transform duration-500 ease-out will-change-transform group-hover:-translate-y-1"
        style={{ background: "var(--vault-surface)" }}
      >
        {/* ── Image ─────────────────────────────────────────────────── */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <div
            className="absolute inset-0 flex h-full transition-transform duration-1000 ease-out will-change-transform"
            style={{ transform: `translateX(-${currentImageIdx * 100}%)` }}
          >
            {item.images.slice(0, 5).map((img, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={idx} className="relative min-w-full h-full">
                  <Image
                    src={img}
                    alt={`${item.name} view ${idx + 1}`}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-6 transition-transform duration-1000 ease-in-out group-hover:scale-105 will-change-transform"
                    priority={priority && isFirst}
                  />
                </div>
              );
            })}
          </div>

          {/* Gold shimmer on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(171,126,34,0.08) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              animation: "vault-shimmer 1.4s ease-out",
            }}
          />

          {/* Limited badge — text only, no icon */}
          {isLimited && (
            <div
              className="absolute top-4 left-4 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.2em]"
              style={{ color: "var(--vault-gold)", border: "1px solid var(--vault-gold)", background: "var(--vault-bg)" }}
            >
              Limited
            </div>
          )}

          {/* Vault 3D Badge */}
          {item.modelUrl && (
            <div
              className="absolute bottom-4 left-4 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.2em] flex items-center gap-1.5 backdrop-blur-md pointer-events-none"
              style={{
                color: "var(--vault-gold)",
                border: "1px solid rgba(171,126,34,0.3)", // gold with opacity
                background: "rgba(28,21,16,0.8)" // matching vault bg
              }}
            >
              <Cuboid className="w-3 h-3" strokeWidth={1.5} />
              <span>3D</span>
            </div>
          )}
        </div>

        {/* ── Info ──────────────────────────────────────────────────── */}
        <div
          className="px-5 py-4 border-t"
          style={{ borderColor: "var(--vault-border)" }}
        >
          {/* Brand / Edition row */}
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[9px] font-mono uppercase tracking-[0.25em]"
              style={{ color: "var(--vault-muted)" }}
            >
              {item.brand ?? "Aethelon"}
            </p>
            {edition && (
              <p className="text-[9px] font-mono" style={{ color: "var(--vault-gold)" }}>
                {edition}
              </p>
            )}
          </div>

          <h3
            className="text-sm font-light leading-snug line-clamp-2 tracking-wide mb-3 group-hover:opacity-80 transition-opacity"
            style={{ color: "var(--vault-fg)" }}
          >
            {item.name}
          </h3>

          {/* Price + arrow */}
          <div className="flex items-center justify-between">
            <p
              className="text-sm font-mono font-medium"
              style={{ color: "var(--vault-gold-bright)" }}
            >
              {displayPrice(item.price)}
            </p>
            <span
              className="text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: "var(--vault-gold)" }}
            >
              View →
            </span>
          </div>
        </div>

        {/* Bottom border glow on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "linear-gradient(90deg, transparent, var(--vault-gold), transparent)" }}
        />
      </div>
    </Link>
  );
}

export function LoadingPremiumProductCard() {
  return (
    <div className="animate-pulse" style={{ background: "var(--vault-surface)" }}>
      <div className="aspect-[3/4]" style={{ background: "var(--vault-surface-2)" }} />
      <div className="px-5 py-4 space-y-2" style={{ borderTop: "1px solid var(--vault-border)" }}>
        <div className="h-2 rounded w-16" style={{ background: "var(--vault-surface-2)" }} />
        <div className="h-3 rounded w-4/5" style={{ background: "var(--vault-surface-2)" }} />
        <div className="h-3 rounded w-24" style={{ background: "var(--vault-surface-2)" }} />
      </div>
    </div>
  );
}

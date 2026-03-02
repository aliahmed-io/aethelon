import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import prisma, { safeQuery } from "@/lib/db";
import { PremiumProductCard, LoadingPremiumProductCard } from "@/components/storefront/PremiumProductCard";
import { PremiumSort } from "./PremiumSort";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Vault | Aethelon",
  description: "Rare and exceptional pieces. A private gallery of curated premium furniture.",
};

function getOrderBy(sort: string | string[] | undefined) {
  const s = (Array.isArray(sort) ? sort[0] : sort) || "price-desc";
  switch (s) {
    case "price-asc": return { price: "asc" as const };
    case "newest": return { createdAt: "desc" as const };
    case "name-asc": return { name: "asc" as const };
    default: return { price: "desc" as const };
  }
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string | string[] }>;
}) {
  noStore();
  const params = await searchParams;
  const orderBy = getOrderBy(params.sort);

  const products = await safeQuery(
    prisma.product.findMany({
      where: {
        status: "published",
        isVaultExclusive: true,
      },
      orderBy,
      select: {
        id: true, name: true, description: true, price: true,
        images: true, discountPercentage: true, brand: true, tags: true,
        modelUrl: true,
      },
    }),
    []
  );

  const isEmpty = products.length === 0;

  return (
    /* ── vault scope — applies CSS custom properties from globals.css ── */
    <div
      className="vault min-h-screen pb-24 selection:bg-[var(--vault-gold)]/20 selection:text-[var(--vault-fg)]"
      style={{ background: "var(--vault-bg)", color: "var(--vault-fg)" }}
    >
      <div className="pt-32 container mx-auto px-6 lg:px-12">

        {/* ── Header ───────────────────────────────────────────────── */}
        <header
          className="border-b pb-14 mb-16"
          style={{ borderColor: "var(--vault-border)" }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
            <div>
              {/* Eyebrow — plain type, no icon */}
              <p
                className="text-[10px] font-mono uppercase tracking-[0.35em] mb-5"
                style={{ color: "var(--vault-gold)" }}
              >
                Rare &amp; Exceptional · Private Collection
              </p>

              <h1
                className="text-5xl lg:text-8xl font-light tracking-[0.06em] uppercase mb-3"
                style={{
                  color: "var(--vault-fg)",
                  animation: "vault-reveal 0.9s ease-out both",
                }}
              >
                The Vault
              </h1>

              {/* Thin gold rule */}
              <div
                className="w-16 h-px mb-4"
                style={{ background: "var(--vault-gold)", opacity: 0.6 }}
              />

              <p
                className="font-mono text-sm tracking-widest"
                style={{
                  color: "var(--vault-muted)",
                  animation: "vault-reveal 0.9s ease-out 0.15s both",
                }}
              >
                Curated pieces · Limited availability
              </p>
            </div>

            {!isEmpty && (
              <div
                className="flex flex-wrap items-center gap-10"
                style={{ animation: "vault-reveal 1s ease-out 0.3s both" }}
              >
                {/* Count */}
                <div className="text-right">
                  <p
                    className="text-[9px] uppercase tracking-widest mb-1 font-mono"
                    style={{ color: "var(--vault-muted)" }}
                  >
                    Pieces
                  </p>
                  <p className="text-4xl font-light tabular-nums" style={{ color: "var(--vault-fg)" }}>
                    {products.length.toString().padStart(2, "0")}
                  </p>
                </div>

                <Suspense fallback={null}>
                  <PremiumSort />
                </Suspense>
              </div>
            )}
          </div>
        </header>

        {/* ── Grid / Empty state ───────────────────────────────────── */}
        {!isEmpty ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t"
            style={{ borderColor: "var(--vault-border)" }}
          >
            {products.map((item, idx) => (
              <div
                key={item.id}
                style={{ background: "var(--vault-bg)", borderColor: "var(--vault-border)" }}
                className="min-h-[420px] border-r border-b"
              >
                <PremiumProductCard item={item} priority={idx < 4} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty / throttled state */
          <div
            className="min-h-[55vh] flex flex-col items-center justify-center border"
            style={{ borderColor: "var(--vault-border)", background: "var(--vault-surface)" }}
          >
            {/* Thin circle — no Sparkles */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-8 border"
              style={{ borderColor: "var(--vault-gold)", opacity: 0.6 }}
            >
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--vault-gold)" }}
              />
            </div>

            <p
              className="text-[9px] font-mono uppercase tracking-[0.3em] mb-4"
              style={{ color: "var(--vault-gold)" }}
            >
              Collection unavailable
            </p>
            <h2
              className="text-2xl font-light tracking-widest uppercase mb-4"
              style={{ color: "var(--vault-fg)" }}
            >
              The Vault
            </h2>
            <p
              className="max-w-sm text-center mb-12 font-light leading-relaxed text-sm"
              style={{ color: "var(--vault-muted)" }}
            >
              Our rarest and most exceptional pieces appear here. Stock is
              limited and not guaranteed — enquiries are taken by appointment.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] transition-colors duration-300"
              style={{ color: "var(--vault-muted)" }}
            >
              Explore the Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

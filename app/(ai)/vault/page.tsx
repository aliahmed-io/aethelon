import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import prisma from "@/lib/db";
import { PremiumProductCard } from "@/components/storefront/PremiumProductCard";
import { PremiumSort } from "./PremiumSort";

export const metadata = {
  title: "Premium Collection | Aethelon",
  description: "Rare and exceptional pieces. Curated premium furniture.",
};

function getOrderBy(sort: string | string[] | undefined) {
  const s = (Array.isArray(sort) ? sort[0] : sort) || "price-desc";
  switch (s) {
    case "price-asc":
      return { price: "asc" as const };
    case "newest":
      return { createdAt: "desc" as const };
    case "name-asc":
      return { name: "asc" as const };
    case "price-desc":
    default:
      return { price: "desc" as const };
  }
}

export default async function PremiumProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string | string[] }>;
}) {
  const params = await searchParams;
  const orderBy = getOrderBy(params.sort);

  const premiumProducts = await prisma.product.findMany({
    where: {
      status: "published",
      OR: [
        { isFeatured: true },
        { tags: { has: "premium" } },
        { tags: { has: "rare" } },
      ],
    },
    orderBy,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      images: true,
      discountPercentage: true,
      brand: true,
    },
  });

  return (
    <div className="bg-background min-h-screen text-foreground pb-20 selection:bg-accent/30">
      <div className="pt-32 container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="border-b border-border pb-12 mb-16">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent">
                  Rare & Exceptional
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-2 uppercase opacity-0 animate-[slideUp_0.8s_ease-out_0.1s_forwards]">
                Premium Collection
              </h1>
              <p className="text-muted-foreground font-mono text-sm tracking-widest pl-1 opacity-0 animate-[slideUp_0.8s_ease-out_0.2s_forwards]">
                CURATED PIECES • LIMITED AVAILABILITY
              </p>
            </div>

            {premiumProducts.length > 0 && (
              <div className="flex flex-wrap items-center gap-8 text-right opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Pieces
                  </p>
                  <p className="text-3xl font-light">
                    {premiumProducts.length.toString().padStart(2, "0")}
                  </p>
                </div>
                <Suspense fallback={null}>
                  <PremiumSort />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid — sort only, no filters */}
        {premiumProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
            {premiumProducts.map((item, idx) => (
              <div
                key={item.id}
                className="opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <PremiumProductCard item={item} priority={idx < 4} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="min-h-[50vh] flex flex-col items-center justify-center border border-border rounded-sm bg-muted/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-accent/10 to-transparent flex items-center justify-center mb-8 border border-border shadow-2xl relative">
              <div className="absolute inset-0 rounded-full border border-accent/20 animate-[ping_3s_linear_infinite]" />
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-light tracking-wide mb-3 uppercase">
              Premium Collection
            </h2>
            <p className="text-muted-foreground max-w-md text-center mb-10 font-light leading-relaxed">
              Our rarest and most exceptional pieces will appear here.
              Stock is limited and not guaranteed—inquiries by request.
            </p>

            <Link
              href="/shop"
              className="group relative px-8 py-4 bg-accent text-accent-foreground overflow-hidden rounded-sm hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-3 font-bold text-xs uppercase tracking-[0.2em]">
                Explore Full Collection
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

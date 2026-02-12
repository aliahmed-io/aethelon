import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Truck, Shield } from "lucide-react";
import { WriteReviewSection } from "@/components/storefront/WriteReviewSection";
import { RecentFeedbackSection } from "@/components/storefront/RecentFeedbackSection";
import {
    ThreeDViewerLazy,
    ARButtonLazy,
    ProductTrackerLazy,
} from "@/components/product/ProductClientWrappers";
import Prisma from "@/lib/db";

/**
 * ─── Tier 2: Post-Hydration Components ───────────────────────────────
 * Loaded via dynamic import after the core page renders.
 * Each gets a skeleton placeholder to prevent CLS.
 */
const RecentlyViewed = dynamic(
    () => import("@/components/product/RecentlyViewed").then((m) => m.RecentlyViewed),
    {
        loading: () => (
            <div className="py-16 px-6 lg:px-12">
                <div className="h-6 w-48 bg-muted animate-pulse rounded mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm" />
                    ))}
                </div>
            </div>
        ),
    }
);

const SizeGuideButton = dynamic(
    () => import("@/components/features/SizeGuideModal").then((m) => m.SizeGuideButton),
    { loading: () => <span className="text-xs text-muted-foreground">Size Guide</span> }
);

/**
 * ─── Tier 3: On-Interaction Components ───────────────────────────────
 * ThreeDViewer, ARButton, ProductTracker are in client wrappers
 * (ProductClientWrappers.tsx) to isolate `ssr: false` from this
 * Server Component page. ClickToLoad is SSR-safe.
 */
const ClickToLoad = dynamic(
    () => import("@/components/product/ClickToLoad").then((m) => m.ClickToLoad),
    { loading: () => null }
);

const TouchGallery = dynamic(
    () => import("@/components/product/TouchGallery").then((m) => m.TouchGallery),
    { loading: () => <div className="aspect-square bg-muted animate-pulse rounded-sm" /> }
);


// ─── Page Props ──────────────────────────────────────────────────────
interface ProductPageProps {
    params: Promise<{ id: string }>;
}

// Calculate estimated delivery date (3-5 business days)
function getEstimatedDelivery(): string {
    const today = new Date();
    const minDays = 3;
    const maxDays = 5;

    let businessDaysAdded = 0;
    const deliveryDate = new Date(today);

    while (businessDaysAdded < maxDays) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        const dayOfWeek = deliveryDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDaysAdded++;
        }
    }

    const minDate = new Date(today);
    businessDaysAdded = 0;
    while (businessDaysAdded < minDays) {
        minDate.setDate(minDate.getDate() + 1);
        const dayOfWeek = minDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDaysAdded++;
        }
    }

    const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${formatDate(minDate)} - ${formatDate(deliveryDate)}`;
}

// Mock data removed (Connected to DB)

// Static generation for known products (Top 20 for performance)
export async function generateStaticParams() {
    const products = await Prisma.product.findMany({
        select: { id: true },
        take: 20,
    });
    return products.map((p) => ({ id: p.id }));
}

// ─── Tier 1: Server-Rendered Core ────────────────────────────────────
// Gallery image, title, price, stock, description, buy button — all SSR.
export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    const product = await Prisma.product.findUnique({
        where: { id },
    });
    if (!product) return notFound();

    const stockLevel = product.stockQuantity ?? 0;
    const isLowStock = stockLevel > 0 && stockLevel <= 5;
    const isInStock = stockLevel > 0;
    const estimatedDelivery = getEstimatedDelivery();

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            {/* Tier 2: Analytics tracker — loaded after hydration, no SSR */}
            <ProductTrackerLazy product={product} />

            <div className="container mx-auto px-6 lg:px-12">
                {/* ── T1: Breadcrumb (server-rendered) ── */}
                <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-12 uppercase tracking-widest" aria-label="Breadcrumb">
                    <Link href="/shop" className="hover:text-foreground transition-colors">Collection</Link>
                    <ChevronRight className="w-3 h-3" aria-hidden />
                    <span className="text-foreground">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* ────── Media Column ────── */}
                    <div className="space-y-8">
                        {/* T1: Static hero image — server-rendered, immediate LCP */}
                        <div className="aspect-square bg-muted border border-border rounded-sm overflow-hidden relative">
                            {product.images[0] && (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            )}
                        </div>

                        {/* T3: 3D Viewer — click to load on desktop */}
                        <div className="hidden md:block">
                            <ClickToLoad
                                label="View in 3D"
                                className="w-full"
                            >
                                <ThreeDViewerLazy
                                    modelUrl={product.modelUrl}
                                    images={product.images}
                                    altTitle={product.name}
                                />
                            </ClickToLoad>
                        </div>

                        {/* T2: Mobile touch gallery — lazy loaded */}
                        <div className="md:hidden">
                            <TouchGallery
                                images={product.images}
                                altTitle={product.name}
                            />
                        </div>

                        {/* T2: Write Review — server component with Suspense */}
                        <Suspense fallback={
                            <div className="py-8 border-t border-border">
                                <div className="h-6 w-40 bg-muted animate-pulse rounded mb-6" />
                                <div className="h-32 bg-muted animate-pulse rounded-sm" />
                            </div>
                        }>
                            <WriteReviewSection productId={product.id} />
                        </Suspense>
                    </div>

                    {/* ────── Details Column (T1: all server-rendered) ────── */}
                    <div className="lg:pt-8">
                        <div>
                            <h2 className="text-sm font-mono text-muted-foreground tracking-widest uppercase mb-2">
                                {product.mainCategory || "Furniture"}
                            </h2>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-foreground mb-6">
                                {product.name}
                            </h1>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-2xl font-light tracking-wide text-foreground">
                                    {formatPrice(product.price)}
                                </p>
                                <SizeGuideButton productName={product.name} />
                            </div>

                            {/* Stock Indicator */}
                            <div className="flex items-center gap-4 mb-8">
                                {isInStock ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isLowStock ? "bg-yellow-500" : "bg-emerald-500"}`} />
                                        <span className={`text-xs uppercase tracking-widest ${isLowStock ? "text-yellow-600" : "text-muted-foreground"}`}>
                                            {isLowStock ? `Only ${stockLevel} left` : "In Stock"}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-xs uppercase tracking-widest text-red-600">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 text-muted-foreground leading-relaxed font-light mb-8 border-t border-border pt-8">
                                <p>{product.description}</p>

                                {product.features && product.features.length > 0 && (
                                    <ul className="list-disc list-outside pl-4 space-y-2 text-sm">
                                        {product.features.map((feature: string, i: number) => (
                                            <li key={i}>{feature}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Delivery & Guarantee Info */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-sm">
                                    <Truck className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Est. Delivery</p>
                                        <p className="text-sm text-foreground font-medium">{estimatedDelivery}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-sm">
                                    <Shield className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Warranty</p>
                                        <p className="text-sm text-foreground font-medium">5 Years</p>
                                    </div>
                                </div>
                            </div>

                            {/* T2: Recent Feedback — server component, Suspense-streamed */}
                            <Suspense fallback={
                                <div className="border-t border-border pt-8">
                                    <div className="h-4 w-32 bg-muted animate-pulse rounded mb-6" />
                                    <div className="space-y-4">
                                        {Array.from({ length: 2 }).map((_, i) => (
                                            <div key={i} className="h-20 bg-muted animate-pulse rounded-sm" />
                                        ))}
                                    </div>
                                </div>
                            }>
                                <RecentFeedbackSection productId={product.id} />
                            </Suspense>
                        </div>

                        <div className="pt-12 border-t border-border space-y-4">
                            <button
                                disabled={!isInStock}
                                className={`w-full h-14 font-bold uppercase tracking-[0.2em] transition-colors rounded-sm ${isInStock
                                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                    }`}
                            >
                                {isInStock ? "Add to Bag" : "Out of Stock"}
                            </button>

                            <button className="w-full h-14 border border-border bg-transparent text-foreground font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2 rounded-sm">
                                Virtual Try-On
                            </button>
                        </div>

                        {/* T3: AR Button — lazy loaded, client only */}
                        <ARButtonLazy
                            modelUrl={product.modelUrl}
                            productId={product.id}
                            productName={product.name}
                        />

                        <p className="text-xs text-center text-muted-foreground font-mono pt-4">
                            SWISS MADE • FREE SHIPPING • SECURE CHECKOUT
                        </p>
                    </div>
                </div>
            </div>

            {/* T2: Recently Viewed — lazy loaded after hydration */}
            <RecentlyViewed />
        </main>
    );
}

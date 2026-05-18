import { notFound } from "next/navigation";
import Prisma from "@/lib/db";
import dynamic from "next/dynamic";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductTrackerLazy } from "@/components/product/ProductClientWrappers";
import Link from "next/link";
import { ProductBackLink } from "@/components/product/ProductBackLink";
import { Metadata, ResolvingMetadata } from "next";
import { CurrencyService, SUPPORTED_CURRENCIES } from "@/modules/currency/currency.service";
import { productSchema, breadcrumbSchema } from "@/lib/structured-data";

// Post-Hydration Components
const RecentlyViewed = dynamic(
    () => import("@/components/product/RecentlyViewed").then((m) => m.RecentlyViewed),
    { loading: () => <div className="h-24 bg-muted/10 animate-pulse" /> }
);

interface ProductPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
    { params }: ProductPageProps,
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const product = await Prisma.product.findUnique({
        where: { id },
        select: { name: true, description: true, images: true, price: true, stockQuantity: true }
    });

    if (!product) return { title: "Product Not Found" };

    const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://aethelon.com";
    const canonicalUrl = `${BASE_URL}/shop/${id}`;
    const ogImage = product.images[0] || "";
    const description = product.description?.substring(0, 160) ?? `Shop ${product.name} at Aethelon — premium handcrafted furniture.`;

    return {
        title: product.name,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: `${product.name} — Aethelon`,
            description,
            url: canonicalUrl,
            type: "website",
            images: ogImage ? [{ url: ogImage, width: 1200, height: 800, alt: product.name }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.name} — Aethelon`,
            description,
            images: ogImage ? [ogImage] : [],
        },
    };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
    const { id } = await params;

    // Resolve search parameters for color selection
    const resolvedSearchParams = await searchParams;
    const colorParam = typeof resolvedSearchParams?.color === 'string' ? resolvedSearchParams.color : undefined;

    const currentCurrency = await CurrencyService.getCurrency();
    const product = await Prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            images: true,
            price: true,
            stockQuantity: true,
            averageRating: true,
            reviewCount: true,
            modelUrl: true,
            usdzUrl: true,
            categories: true,
            variants: true,
        }
    });

    if (!product) return notFound();

    const productForComponents = product as any;

    let displayImages = product.images;
    if (product.variants && product.variants.length > 0) {
        const activeVariant = product.variants.find(v => v.colorName === colorParam) || product.variants[0];
        if (activeVariant && activeVariant.images && activeVariant.images.length > 0) {
            displayImages = activeVariant.images;
        }
    }

    // Fetch related products with 3D models for AR switcher
    const related3DProducts = await Prisma.product.findMany({
        where: {
            modelUrl: { not: null },
            id: { not: product.id },
            categories: { some: { id: { in: product.categories.map((c: { id: string }) => c.id) } } }
        },
        take: 4,
        select: { id: true, name: true, modelUrl: true, images: true }
    });

    // Fallback: if not enough category matches, get any featured 3D products
    if (related3DProducts.length < 4) {
        const moreProducts = await Prisma.product.findMany({
            where: {
                modelUrl: { not: null },
                id: { notIn: [product.id, ...related3DProducts.map((p: { id: string }) => p.id)] },
                isFeatured: true
            },
            take: 4 - related3DProducts.length,
            select: { id: true, name: true, modelUrl: true, images: true }
        });
        related3DProducts.push(...moreProducts);
    }

    const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://aethelon.com";
    const ldProduct = productSchema({
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        price: product.price,
        inStock: product.stockQuantity > 0,
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
    });
    const ldBreadcrumb = breadcrumbSchema([
        { name: "Home", url: BASE_URL },
        { name: "Shop", url: `${BASE_URL}/shop` },
        { name: product.name, url: `${BASE_URL}/shop/${product.id}` },
    ]);

    return (
        <main id="main-content" className="min-h-screen bg-background text-foreground animate-in fade-in duration-1000">
            {/* JSON-LD: Product + Breadcrumb */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProduct) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
            />
            {/* Analytics */}
            <ProductTrackerLazy product={{
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images,
                categoryId: product.categories[0]?.id || "" // Fallback to first category or empty string
            }} />

            <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
                {/* Back Link */}
                <div className="mb-8">
                    <ProductBackLink />
                </div>

                {/* Main Split Layout */}
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24 items-start">

                    {/* Left: Info & Actions (Desktop Order: Info -> Actions) */}
                    {/* On Mobile: Order 2 */}
                    <div className="order-2 lg:order-1 flex flex-col gap-10 lg:sticky lg:top-32 h-fit w-full min-w-0">
                        <ProductInfo product={productForComponents} />
                        <ProductActions
                            productId={product.id}
                            price={product.price}
                            stock={product.stockQuantity}
                            currencyCode={currentCurrency}
                            exchangeRate={SUPPORTED_CURRENCIES[currentCurrency].rate}
                            variants={product.variants}
                        />
                        {/* Try in AR — shown only when a 3D model exists */}
                        {product.modelUrl && (
                            <Link
                                href={`/ar?id=${product.id}`}
                                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] transition-colors hover:opacity-80"
                                style={{ color: "hsl(var(--accent))", border: "1px solid hsl(var(--border))", padding: "10px 16px" }}
                            >
                                <span>⬡</span> Try in AR
                            </Link>
                        )}

                    </div>

                    {/* Right: Gallery (Desktop Order: Gallery) */}
                    {/* On Mobile: Order 1 (Visuals First) */}
                    <div className="order-1 lg:order-2 w-full min-w-0">
                        <ProductGallery
                            productId={product.id}
                            images={displayImages}
                            productName={product.name}
                            modelUrl={product.modelUrl}
                            usdzUrl={product.usdzUrl}
                            related3DProducts={related3DProducts.map((p: { id: string; name: string; modelUrl: string | null; images: string[] }) => ({
                                id: p.id,
                                name: p.name,
                                modelUrl: p.modelUrl!,
                                image: p.images[0] || ""
                            }))}
                        />
                    </div>
                </div>

                {/* Footer / Recents */}
                <div className="mt-32 pt-16 border-t border-border/30">
                    <RecentlyViewed />
                </div>
            </div>
        </main>
    );
}

import { notFound } from "next/navigation";
import Prisma from "@/lib/db";
import dynamic from "next/dynamic";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductTrackerLazy } from "@/components/product/ProductClientWrappers";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const currentCurrency = await CurrencyService.getCurrency();
    const product = await Prisma.product.findUnique({
        where: { id },
        include: { categories: true }
    });

    if (!product) return notFound();

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

            <div className="container mx-auto px-6 lg:px-12 py-24 lg:py-32">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/categories" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Collection
                    </Link>
                </div>

                {/* Main Split Layout */}
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24 items-start">

                    {/* Left: Info & Actions (Desktop Order: Info -> Actions) */}
                    {/* On Mobile: Order 2 */}
                    <div className="order-2 lg:order-1 flex flex-col gap-10 lg:sticky lg:top-32 h-fit">
                        <ProductInfo product={product} />
                        <ProductActions
                            productId={product.id}
                            price={product.price}
                            stock={product.stockQuantity}
                            currencyCode={currentCurrency}
                            exchangeRate={SUPPORTED_CURRENCIES[currentCurrency].rate}
                        />
                    </div>

                    {/* Right: Gallery (Desktop Order: Gallery) */}
                    {/* On Mobile: Order 1 (Visuals First) */}
                    <div className="order-1 lg:order-2">
                        <ProductGallery
                            images={product.images}
                            productName={product.name}
                            modelUrl={product.modelUrl}
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

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
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const product = await Prisma.product.findUnique({
        where: { id },
        select: { name: true, description: true, images: true }
    });

    if (!product) return { title: "Product Not Found" };

    return {
        title: product.name,
        description: product.description?.substring(0, 160),
        openGraph: {
            images: [product.images[0] || ""],
        }
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await Prisma.product.findUnique({ where: { id } });

    if (!product) return notFound();

    return (
        <main className="min-h-screen bg-background text-foreground animate-in fade-in duration-1000">
            {/* Analytics */}
            <ProductTrackerLazy product={{
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images,
                categoryId: product.categoryId
            }} />

            <div className="container mx-auto px-6 lg:px-12 py-24 lg:py-32">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group">
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
                        />
                    </div>

                    {/* Right: Gallery (Desktop Order: Gallery) */}
                    {/* On Mobile: Order 1 (Visuals First) */}
                    <div className="order-1 lg:order-2">
                        <ProductGallery
                            images={product.images}
                            productName={product.name}
                            modelUrl={product.modelUrl}
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

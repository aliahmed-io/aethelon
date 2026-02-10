import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { Navbar } from "@/app/components/Navbar";
import { ThreeDViewer } from "@/app/components/product/ThreeDViewer";
import { ARButton } from "@/app/components/product/ARButton";
import { TouchGallery } from "@/app/components/product/TouchGallery";
import { ProductTracker } from "@/app/components/product/ProductTracker";
import { SizeGuideButton } from "@/app/components/SizeGuideModal";
import { RecentlyViewed } from "@/app/components/RecentlyViewed";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, Truck, Shield } from "lucide-react";
import { WriteReviewSection } from "@/app/components/storefront/WriteReviewSection";
import { RecentFeedbackSection } from "@/app/components/storefront/RecentFeedbackSection";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

// Static generation for all published products
export async function generateStaticParams() {
    const products = await prisma.product.findMany({
        where: { status: "published" },
        select: { id: true },
    });
    return products.map((product) => ({ id: product.id }));
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

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) return notFound();

    const stockLevel = product.stockQuantity ?? 0;
    const isLowStock = stockLevel > 0 && stockLevel <= 5;
    const isInStock = stockLevel > 0;
    const estimatedDelivery = getEstimatedDelivery();

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <Navbar />
            <ProductTracker product={product} />

            <div className="container mx-auto px-6 lg:px-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-12 uppercase tracking-widest">
                    <Link href="/shop" className="hover:text-white transition-colors">Collection</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Media Column */}
                    <div className="space-y-8">
                        {/* Desktop: 3D Viewer / Mobile: Hidden */}
                        <div className="hidden md:block">
                            <ThreeDViewer
                                modelUrl={product.modelUrl}
                                images={product.images}
                                altTitle={product.name}
                            />
                        </div>

                        {/* Mobile: Touch Gallery / Desktop: Hidden */}
                        <div className="md:hidden">
                            <TouchGallery
                                images={product.images}
                                altTitle={product.name}
                            />
                        </div>

                        {/* Write Review Section - Full width under image */}
                        <WriteReviewSection productId={product.id} />
                    </div>

                    {/* Details Column */}
                    <div className="lg:pt-8">
                        <div>
                            <h2 className="text-sm font-mono text-white/50 tracking-widest uppercase mb-2">
                                {product.mainCategory || "Timepiece"}
                            </h2>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-white mb-6">
                                {product.name}
                            </h1>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-2xl font-light tracking-wide text-white">
                                    {formatPrice(product.price)}
                                </p>
                                <SizeGuideButton productName={product.name} />
                            </div>

                            {/* Stock Indicator */}
                            <div className="flex items-center gap-4 mb-8">
                                {isInStock ? (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isLowStock ? "bg-yellow-500" : "bg-emerald-500"}`} />
                                        <span className={`text-xs uppercase tracking-widest ${isLowStock ? "text-yellow-500" : "text-white/50"}`}>
                                            {isLowStock ? `Only ${stockLevel} left` : "In Stock"}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-xs uppercase tracking-widest text-red-500">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 text-white/70 leading-relaxed font-light mb-8 border-t border-white/5 pt-8">
                                <p>{product.description}</p>

                                {product.features.length > 0 && (
                                    <ul className="list-disc list-outside pl-4 space-y-2 text-sm">
                                        {product.features.map((feature: string, i: number) => (
                                            <li key={i}>{feature}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Delivery & Guarantee Info */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10">
                                    <Truck className="w-5 h-5 text-white/40" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-white/40">Est. Delivery</p>
                                        <p className="text-sm text-white font-medium">{estimatedDelivery}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10">
                                    <Shield className="w-5 h-5 text-white/40" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-white/40">Warranty</p>
                                        <p className="text-sm text-white font-medium">5 Years</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Feedback - Stays in right column */}
                            <RecentFeedbackSection productId={product.id} />
                        </div>

                        <div className="pt-12 border-t border-white/5 space-y-4">
                            <button
                                disabled={!isInStock}
                                className={`w-full h-14 font-bold uppercase tracking-[0.2em] transition-colors ${isInStock
                                    ? "bg-white text-black hover:bg-[#E5E5E5]"
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                                    }`}
                            >
                                {isInStock ? "Add to Bag" : "Out of Stock"}
                            </button>

                            <button className="w-full h-14 border border-white/20 bg-transparent text-white font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                                Virtual Try-On
                            </button>
                        </div>

                        {/* Native WebAR (Tier 1) */}
                        <ARButton
                            modelUrl={product.modelUrl}
                            productId={product.id}
                            productName={product.name}
                        />

                        <p className="text-xs text-center text-white/30 font-mono pt-4">
                            SWISS MADE • FREE SHIPPING • SECURE CHECKOUT
                        </p>
                    </div>
                </div>
            </div>

            {/* Recently Viewed */}
            <RecentlyViewed />
        </main>

    );
}

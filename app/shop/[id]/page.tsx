import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ThreeDViewer } from "@/components/product/ThreeDViewer";
import { ARButton } from "@/components/product/ARButton";
import { TouchGallery } from "@/components/product/TouchGallery";
import { ProductTracker } from "@/components/product/ProductTracker";
import { SizeGuideButton } from "@/components/features/SizeGuideModal";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, Truck, Shield } from "lucide-react";
import { WriteReviewSection } from "@/components/storefront/WriteReviewSection";
import { RecentFeedbackSection } from "@/components/storefront/RecentFeedbackSection";

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

// Mock data for build verification
const MOCK_PRODUCTS = {
    "1": {
        id: "1",
        name: "Aethelon Executive Desk",
        price: 4500,
        images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2000&auto=format&fit=crop"],
        stockQuantity: 150,
        mainCategory: "Office",
        description: "A premium executive desk.",
        features: ["Solid Oak", "Cable Management", "Leather Inlay"],
        modelUrl: "https://model-viewer.assets/chair.glb", // Dummy URL
    },
    "2": {
        id: "2",
        name: "Aethelon Lounge Chair",
        price: 2800,
        images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=2000&auto=format&fit=crop"],
        stockQuantity: 45,
        mainCategory: "Living",
        description: "Luxurious lounge chair.",
        features: ["Velvet Upholstery", "Brass Legs"],
        modelUrl: "https://model-viewer.assets/chair.glb",
    }
};

// Static generation
export async function generateStaticParams() {
    return [{ id: "1" }, { id: "2" }];
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    // Type casting for mock data compatibility
    const product = MOCK_PRODUCTS[id as keyof typeof MOCK_PRODUCTS] as any;

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

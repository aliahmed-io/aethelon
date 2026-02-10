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
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <Navbar />
            <ProductTracker product={product} />

            <div className="container mx-auto px-6 lg:px-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-12 uppercase tracking-widest">
                    <Link href="/shop" className="hover:text-foreground transition-colors">Collection</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground">{product.name}</span>
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
                            <h2 className="text-sm font-mono text-muted-foreground tracking-widest uppercase mb-2">
                                {product.mainCategory || "Timepiece"}
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

                            {/* Recent Feedback - Stays in right column */}
                            <RecentFeedbackSection productId={product.id} />
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

                        {/* Native WebAR (Tier 1) */}
                        <ARButton
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

            {/* Recently Viewed */}
            <RecentlyViewed />
        </main>

    );
}

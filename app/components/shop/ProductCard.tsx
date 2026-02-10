import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

// Tiny blur placeholder (1x1 dark gray)
import { Box } from "lucide-react";
const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    // Fallback image if none
    const mainImage = product.images[0] || "/assets/placeholder_watch.png";

    return (
        <Link href={`/shop/${product.id}`} className="group block relative" data-testid="product-card">
            <div className="aspect-[4/5] relative overflow-hidden bg-[#0A0A0C] border border-white/5 transition-colors duration-500 group-hover:border-white/20">
                <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                />

                {/* Quick Add Overlay (Optional luxury touch) */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <button className="w-full py-3 text-xs tracking-widest uppercase bg-white text-black hover:bg-[#E5E5E5] transition-colors">
                        Quick View
                    </button>
                </div>

                {/* 3D Indicator Badge */}
                {product.modelUrl && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-2 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                            <Box className="w-3.5 h-3.5" strokeWidth={2} />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-between items-start">
                <div>
                    <h3 className="text-sm text-[#EDEDED] font-medium tracking-wide uppercase">
                        {product.name}
                    </h3>
                    <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">
                        {product.style || "Automatic"}
                    </p>
                </div>
                <p className="text-sm text-[#EDEDED] font-light tracking-wide">
                    {formatPrice(product.price)}
                </p>
            </div>

        </Link>
    );
}


export function LoadingProductCard() {
    return (
        <div className="flex flex-col space-y-4">
            <div className="aspect-[4/5] bg-white/5 rounded-sm animate-pulse" />
            <div className="space-y-2">
                <div className="h-4 bg-white/5 rounded-sm w-3/4 animate-pulse" />
                <div className="h-3 bg-white/5 rounded-sm w-1/2 animate-pulse" />
            </div>
        </div>
    );
}

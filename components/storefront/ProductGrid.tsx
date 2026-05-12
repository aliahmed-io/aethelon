"use client";

import { ProductCard } from "@/components/storefront/ProductCard";

interface ProductGridProps {
    products: any[];
}

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center p-8 border border-border bg-muted/50 backdrop-blur-md rounded-sm text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-xl">🪑</span>
                </div>
                <h3 className="text-lg font-light tracking-wide uppercase mb-2">No Products Found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Our collection is currently empty for the selected criteria.
                </p>
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-16 md:animate-in md:fade-in md:slide-in-from-bottom-8 md:duration-700"
            data-testid="product-grid"
        >
            {products.map((product, idx) => {
                // Editorial stagger: offset alternate items on desktop
                const isStaggered = idx % 2 !== 0;
                
                return (
                    <div
                        key={product.id}
                        className={`md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-500 md:fill-mode-backwards transition-transform ${isStaggered ? 'md:mt-16' : ''}`}
                        style={idx === 0 ? undefined : { animationDelay: `${idx * 100}ms` }}
                    >
                        <ProductCard item={product} priority={idx < 4} />
                    </div>
                );
            })}
        </div>
    );
}

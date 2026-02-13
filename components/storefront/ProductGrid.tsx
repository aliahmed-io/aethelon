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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700"
            data-testid="product-grid"
        >
            {products.map((product, idx) => (
                <div
                    key={product.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <ProductCard item={product} />
                </div>
            ))}
        </div>
    );
}

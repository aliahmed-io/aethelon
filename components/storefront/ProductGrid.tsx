"use client";

import { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { ProductCard } from "./ProductCard";
import { loadMoreProducts } from "@/app/store/actions";
import { Loader2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    discountPercentage: number;
    modelUrl?: string | null;
}

interface ProductGridProps {
    initialProducts: Product[];
    category: string;
    sort?: string;
    price?: string;
    color?: string;
    size?: string;
}

export function ProductGrid({
    initialProducts,
    category,
    sort,
    price,
    color,
    size,
}: ProductGridProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [offset, setOffset] = useState(initialProducts.length);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const { ref, inView } = useInView();

    useEffect(() => {
        // Reset state when filters change
        setProducts(initialProducts);
        setOffset(initialProducts.length);
        setHasMore(true);
        setLoading(false);
    }, [category, sort, price, color, size, initialProducts]);

    const loadMore = useCallback(async () => {
        setLoading(true);
        try {
            const newProducts = await loadMoreProducts({
                offset,
                limit: 15,
                category,
                sort,
                price,
                color,
                size,
            });

            if (newProducts.length === 0) {
                setHasMore(false);
            } else {
                setProducts((prev) => [...prev, ...newProducts]);
                setOffset((prev) => prev + newProducts.length);
            }
        } catch (error) {
            console.error("Failed to load more products:", error);
        } finally {
            setLoading(false);
        }
    }, [offset, category, sort, price, color, size]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMore();
        }
    }, [inView, hasMore, loading, loadMore]);

    return (
        <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((item, index) => (
                    <ProductCard item={item} key={`${item.id}-${index}`} priority={index < 4} />
                ))}
            </div>

            {hasMore && (
                <div ref={ref} className="flex justify-center p-8 w-full">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <div className="h-8" />}
                </div>
            )}
        </>
    );
}

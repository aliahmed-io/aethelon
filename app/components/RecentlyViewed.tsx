"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Clock } from "lucide-react";

interface RecentProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    viewedAt: number;
}

const STORAGE_KEY = "velorum_recently_viewed";
const MAX_ITEMS = 8;

// Get recently viewed products from localStorage
function getRecentlyViewed(): RecentProduct[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Add product to recently viewed
export function addToRecentlyViewed(product: { id: string; name: string; price: number; images: string[] }) {
    if (typeof window === "undefined") return;

    try {
        const current = getRecentlyViewed();

        // Remove if already exists
        const filtered = current.filter(p => p.id !== product.id);

        // Add to beginning
        const updated = [{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || "",
            viewedAt: Date.now()
        }, ...filtered].slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error("Failed to save recently viewed:", e);
    }
}

export function RecentlyViewed() {
    const [products, setProducts] = useState<RecentProduct[]>([]);

    useEffect(() => {
        setProducts(getRecentlyViewed());
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="py-16 px-6 lg:px-12 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center gap-3 mb-8">
                    <Clock className="w-4 h-4 text-white/40" />
                    <h2 className="text-xs uppercase tracking-widest text-white/40">Recently Viewed</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.id}`}
                            className="group"
                        >
                            <div className="aspect-square bg-white/5 relative overflow-hidden mb-3">
                                {product.image && (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                )}
                            </div>
                            <h3 className="text-sm text-white/70 group-hover:text-white transition-colors truncate">
                                {product.name}
                            </h3>
                            <p className="text-xs text-white/40">{formatPrice(product.price)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

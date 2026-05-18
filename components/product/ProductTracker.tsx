"use client";

import { useEffect } from "react";
import { addToRecentlyViewed } from "@/components/product/RecentlyViewed";

interface ProductTrackerProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
        categoryId: string;
    };
}

export function ProductTracker({ product }: ProductTrackerProps) {
    useEffect(() => {
        addToRecentlyViewed(product);

        const payload = JSON.stringify({
            productId: product.id,
            categoryId: product.categoryId,
        });

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            navigator.sendBeacon("/api/analytics/view", new Blob([payload], { type: "application/json" }));
        } else {
            fetch("/api/analytics/view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
            }).catch(() => {});
        }
    }, [product]);

    return null;
}

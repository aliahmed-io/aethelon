"use client";

import { useEffect } from "react";
import { addToRecentlyViewed } from "@/components/product/RecentlyViewed";
import { trackProductView } from "@/app/actions/personalization";

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
        // Fire and forget server action
        trackProductView(product.id, product.categoryId);
    }, [product]);

    return null;
}

"use client";

import { useEffect } from "react";
import { addToRecentlyViewed } from "@/components/product/RecentlyViewed";

interface ProductTrackerProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
    };
}

export function ProductTracker({ product }: ProductTrackerProps) {
    useEffect(() => {
        addToRecentlyViewed(product);
    }, [product]);

    return null;
}

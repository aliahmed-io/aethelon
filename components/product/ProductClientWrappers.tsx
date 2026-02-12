"use client";

import dynamic from "next/dynamic";

const ThreeDViewerInner = dynamic(
    () => import("@/components/product/ThreeDViewer").then((m) => m.ThreeDViewer),
    { ssr: false, loading: () => <div className="aspect-square bg-muted animate-pulse rounded-sm" /> }
);

const ARButtonInner = dynamic(
    () => import("@/components/product/ARButton").then((m) => m.ARButton),
    { ssr: false, loading: () => null }
);

const ProductTrackerInner = dynamic(
    () => import("@/components/product/ProductTracker").then((m) => m.ProductTracker),
    { ssr: false, loading: () => null }
);

/**
 * Client wrappers for SSR-incompatible product components.
 * Isolate `ssr: false` behind "use client" boundary so the
 * product page can remain a Server Component.
 */

export function ThreeDViewerLazy(props: {
    modelUrl: string;
    images: string[];
    altTitle: string;
}) {
    return <ThreeDViewerInner {...props} />;
}

export function ARButtonLazy(props: {
    modelUrl: string;
    productId: string;
    productName: string;
}) {
    return <ARButtonInner {...props} />;
}

export function ProductTrackerLazy(props: {
    product: { id: string; name: string; price: number; images: string[] };
}) {
    return <ProductTrackerInner {...props} />;
}

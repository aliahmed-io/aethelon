"use client";

import dynamic from "next/dynamic";

const ThreeDViewerInner = dynamic(
    () => import("@/components/product/ArModelViewer").then((m) => m.default),
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
    usdzUrl?: string; // Added for AR
    images: string[];
    altTitle: string;
}) {
    return (
        <ThreeDViewerInner
            src={props.modelUrl}
            iosSrc={props.usdzUrl}
            poster={props.images[0]}
            alt={props.altTitle}
        />
    );
}

export function ARButtonLazy(props: {
    modelUrl: string;
    usdzUrl?: string; // Added for AR
    productId: string;
    productName: string;
}) {
    return <ARButtonInner {...props} />;
}

export function ProductTrackerLazy(props: {
    product: { id: string; name: string; price: number; images: string[]; categoryId: string };
}) {
    return <ProductTrackerInner {...props} />;
}

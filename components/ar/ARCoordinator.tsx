"use client";

import { useState } from "react";
import { useCapabilities } from "@/components/ar/useCapabilities";
import { ArSession } from "@/components/ar/ArSession";
import { RoomVisualizerClient } from "@/components/visualizer/RoomVisualizerClient";
import type { VisualizerProduct } from "@/components/visualizer/types";

interface ARCoordinatorProps {
    products: VisualizerProduct[];
    preselectedProductId?: string;
}

export function ARCoordinator({ products, preselectedProductId }: ARCoordinatorProps) {
    const { isMobile, loading } = useCapabilities();
    const [forceManualMode, setForceManualMode] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If mobile AND user hasn't opted to use manual photo mode
    if (isMobile && !forceManualMode) {
        // Find the selected product, fallback to the first one available
        const selected = preselectedProductId
            ? products.find((p) => p.id === preselectedProductId) ?? products[0]
            : products[0];

        if (!selected) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground p-12 text-center">
                    No 3D products available.
                </div>
            );
        }

        return (
            <ArSession
                modelUrl={selected.modelUrl}
                usdzUrl={selected.usdzUrl}
                related3DProducts={products
                    .filter((p) => p.id !== selected.id)
                    .map((p) => ({
                        id: p.id,
                        name: p.name,
                        modelUrl: p.modelUrl,
                        image: p.images[0] ?? "",
                    }))}
                onTriggerFallback={() => setForceManualMode(true)}
            />
        );
    }

    return (
        <RoomVisualizerClient
            products={products}
            preselectedProductId={preselectedProductId}
        />
    );
}

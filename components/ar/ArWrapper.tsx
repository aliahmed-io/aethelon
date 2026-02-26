"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useCapabilities } from "@/components/ar/useCapabilities";
import { Smartphone, X } from "lucide-react";
import "@google/model-viewer";

// Lazy load the ArSession for the model-viewer AR path
const ArSessionLazy = dynamic(
    () => import("@/components/ar/ArSession").then((m) => m.ArSession),
    { ssr: false }
);

// model-viewer element type
type ModelViewerEl = HTMLElement & {
    activateAR(): void;
    canActivateAR: boolean;
};

interface ArWrapperProps {
    modelUrl: string;
    usdzUrl?: string | null;
    productName: string;
    related3DProducts?: {
        id: string;
        name: string;
        modelUrl: string;
        image: string;
    }[];
}

export function ArWrapper({ modelUrl, usdzUrl, productName, related3DProducts }: ArWrapperProps) {
    const { isMobile, loading } = useCapabilities();
    const [isOpen, setIsOpen] = useState(false);

    if (loading) return null;

    // Fix #5: show on all mobile devices, not just WebXR-capable ones.
    // model-viewer delegates to Scene Viewer (Android) or Quick Look (iOS).
    if (!isMobile) return null;

    return (
        <div className="fixed bottom-24 right-6 z-40">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-medium"
                aria-label={`View ${productName} in your room`}
            >
                <Smartphone className="w-5 h-5" />
                <span>View in Room</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-black/60 text-white"
                        aria-label="Close AR"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <ArSessionLazy
                        modelUrl={modelUrl}
                        usdzUrl={usdzUrl}
                        related3DProducts={related3DProducts}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}

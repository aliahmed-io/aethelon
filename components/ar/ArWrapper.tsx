"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCapabilities } from "@/components/ar/useCapabilities";
import { Smartphone, Loader2, X } from "lucide-react";
import { arStore } from "@/components/ar/ArSession";

// Lazy load the heavy AR session
const ArSessionLazy = dynamic(
    () => import("@/components/ar/ArSession").then((m) => m.ArSession),
    { ssr: false }
);

interface ArWrapperProps {
    modelUrl: string;
    productName: string;
}

export function ArWrapper({ modelUrl, productName }: ArWrapperProps) {
    const { isMobile, isWebXrSupported, loading } = useCapabilities();
    const [isOpen, setIsOpen] = useState(false);

    // In this simplified architecture without redux/global state for AR,
    // we use the store to trigger the session directly.

    if (loading) return null;

    // Strict: Mobile Only
    if (!isMobile) return null;

    // Strict: WebXR Support
    if (!isWebXrSupported) return null;

    return (
        <div className="fixed bottom-24 right-6 z-40">
            <button
                onClick={() => {
                    setIsOpen(true);
                    arStore.enterAR();
                }}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-medium"
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
                    <ArSessionLazy modelUrl={modelUrl} onClose={() => setIsOpen(false)} />
                </div>
            )}
        </div>
    );
}

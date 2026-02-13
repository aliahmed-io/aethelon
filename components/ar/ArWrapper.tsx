"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCapabilities } from "@/components/ar/useCapabilities";
import { Smartphone, Loader2, X } from "lucide-react";
import { createXRStore } from "@react-three/xr";

// Lazy load the heavy AR session
const ArSessionLazy = dynamic(
    () => import("@/components/ar/ArSession").then((m) => m.ArSession),
    { ssr: false }
);

interface ArWrapperProps {
    modelUrl: string;
    productName: string;
}

const store = createXRStore();

export function ArWrapper({ modelUrl, productName }: ArWrapperProps) {
    const { isMobile, isWebXrSupported, loading } = useCapabilities();

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
                onClick={() => store.enterAR()}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-medium"
            >
                <Smartphone className="w-5 h-5" />
                <span>View in Room</span>
            </button>

            {/* 
                In a real v6 implementation, the button onClick typically 
                starts the session which takes over the whole screen. 
                We don't render ArSessionLazy "inline" usually, 
                but we need it in the tree to provide volume.
                For this refined implementation, we follow the pattern of 
                having the store control the entry.
            */}
        </div>
    );
}

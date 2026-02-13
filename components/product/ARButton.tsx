"use client";


import React, { useEffect, useRef } from "react";
import { Box } from "lucide-react";

// Dynamically import model-viewer to avoid SSR issues
const ModelViewerElement = () => {
    useEffect(() => {
        import("@google/model-viewer").catch(console.error);
    }, []);
    return null;
};

interface ARButtonProps {
    modelUrl: string | null;
    usdzUrl?: string | null; // Added for iOS AR
    productId: string;
    productName: string;
}

export function ARButton({ modelUrl, usdzUrl, productId, productName }: ARButtonProps) {
    const viewerRef = useRef<HTMLElement>(null);

    // Analytics Helper
    const track = (event: string, data?: any) => {
        // Mock analytics - replace with actual implementation if available
        console.log(`[Analytics] ${event}`, { ...data, timestamp: new Date().toISOString() });
    };

    const openAR = async () => {
        if (!modelUrl) return;

        const viewer = viewerRef.current as any;
        if (!viewer) {
            alert("AR not initialized.");
            return;
        }

        try {
            track("ar_button_clicked", { productId, modelUrl });

            // Check if AR is supported
            if (viewer.canActivateAR) {
                await viewer.activateAR();
                track("ar_session_started", { productId });
            } else {
                // Fallback for desktop or incompatible devices
                // Note: model-viewer might handle some of this, but explicit feedback is good
                alert("AR is not available on this device. Please try on a mobile phone.");
                track("ar_session_failed", { productId, reason: "not_supported" });
            }
        } catch (err) {
            track("ar_session_failed", { productId, error: String(err) });
            console.error("AR launch failed", err);
            alert("Unable to launch AR session.");
        }
    };

    if (!modelUrl) return null;

    return (
        <>
            <ModelViewerElement />

            {/* @ts-ignore */}
            <model-viewer
                ref={viewerRef}
                src={modelUrl || undefined}
                ios-src={usdzUrl || undefined}
                alt={productName || "Aethelon Furniture"}
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="auto"
                camera-controls
                shadow-intensity="1"
                style={{ display: "none" }}
            />

            <div className="w-full">
                <button
                    onClick={openAR}
                    className="w-full h-14 border border-white/20 bg-white/5 text-white font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-3 mb-2"
                    aria-label="View in your space"
                >
                    <Box className="w-4 h-4" />
                    View in your space
                </button>
                <p className="text-[10px] text-white/40 text-center font-mono uppercase tracking-widest">
                    Optional • Complements AI Try-On
                </p>
            </div>
        </>
    );
}

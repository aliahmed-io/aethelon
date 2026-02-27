"use client";

import { useRef } from "react";
import { useCapabilities } from "@/components/ar/useCapabilities";
import { Smartphone } from "lucide-react";
import "@google/model-viewer";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                "ios-src"?: string;
                ar?: boolean | "";
                "ar-modes"?: string;
                "ar-scale"?: string;
                "ar-placement"?: string;
                "camera-controls"?: boolean | "";
                "auto-rotate"?: boolean | "";
                "shadow-intensity"?: string;
                "shadow-softness"?: string;
                exposure?: string;
                "environment-image"?: string;
                loading?: string;
                reveal?: string;
                poster?: string;
                slot?: string;
            };
        }
    }
}

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

export function ArWrapper({ modelUrl, usdzUrl, productName }: ArWrapperProps) {
    const { isMobile, loading } = useCapabilities();

    if (loading) return null;

    // Fix #5: show on all mobile devices, not just WebXR-capable ones.
    // model-viewer delegates to Scene Viewer (Android) or Quick Look (iOS).
    if (!isMobile) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[60]">
            <model-viewer
                src={modelUrl}
                ios-src={usdzUrl ?? undefined}
                ar
                ar-modes="scene-viewer webxr quick-look"
                camera-controls
                style={{ width: 0, height: 0, position: "absolute" }} // invisible
            >
                <button
                    slot="ar-button"
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-medium whitespace-nowrap"
                    aria-label={`View ${productName} in your room`}
                >
                    <Smartphone className="w-5 h-5" />
                    <span>View in Room</span>
                </button>
            </model-viewer>
        </div>
    );
}

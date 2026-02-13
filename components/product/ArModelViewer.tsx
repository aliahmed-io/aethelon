"use client";

import { useEffect, useState } from "react";
import "@google/model-viewer"; // Importing this registers the <model-viewer> web component



interface ArModelViewerProps {
    src: string;
    iosSrc?: string;
    poster?: string;
    alt?: string;
}

export default function ArModelViewer({ src, iosSrc, poster, alt }: ArModelViewerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="w-full h-full bg-muted/20 animate-pulse rounded-sm" />;
    }

    return (
        <div className="w-full h-full relative group">
            <model-viewer
                src={src}
                ios-src={iosSrc}
                poster={poster}
                alt={alt || "A 3D model of the product"}
                shadow-intensity="1"
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="auto"
                ar-placement="floor"
                reveal="auto"
                loading="eager"
                exposure="1"
                shadow-softness="1"
                environment-image="neutral"
                style={{ width: "100%", height: "100%", backgroundColor: "#0A0A0C" }}
            >
                {/* Custom AR Button */}
                <button
                    slot="ar-button"
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 z-50"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    View in Space
                </button>

                {/* Loading Indicator */}
                <div slot="progress-bar" className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div className="h-full bg-accent transition-all duration-300 logic-bar" />
                </div>
            </model-viewer>
        </div>
    );
}

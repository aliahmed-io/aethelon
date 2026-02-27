"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import "@google/model-viewer";

// ---------------------------------------------------------------------------
// arStore stub — kept for backwards-compat with any remaining import sites.
// The WebXR createXRStore approach has been replaced with model-viewer AR.
// ---------------------------------------------------------------------------
export const arStore = {
    /** No-op: AR is now triggered via model-viewer ref in ArSession. */
    enterAR: () => undefined,
};

interface ArSessionProps {
    modelUrl: string;
    usdzUrl?: string | null;
    related3DProducts?: {
        id: string;
        name: string;
        modelUrl: string;
        image: string;
    }[];
    onClose?: () => void;
}

type ModelViewerEl = HTMLElement & {
    activateAR(): void;
    canActivateAR: boolean;
};

/**
 * ArSession — model-viewer-based AR session overlay.
 *
 * Replaces the previous @react-three/xr WebXR implementation which was
 * incompatible with React 19 + @react-three/fiber v9. This approach:
 *  - Uses Google Scene Viewer on Android (via `ar-modes="scene-viewer"`)
 *  - Uses Quick Look on iOS (via `ios-src` / `ar-modes="quick-look"`)
 *  - Requires no WebXR browser flag
 *  - Works on ~95 % of mobile AR-capable devices
 */
export function ArSession({
    modelUrl,
    usdzUrl,
    related3DProducts = [],
    onClose,
}: ArSessionProps) {
    const [activeModelUrl, setActiveModelUrl] = useState(modelUrl);
    const [activeUsdzUrl, setActiveUsdzUrl] = useState(usdzUrl ?? null);
    const [hasLaunched, setHasLaunched] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [arUnavailable, setArUnavailable] = useState(false);
    const [arStatus, setArStatus] = useState<string | null>(null);

    // Use a dedicated canvas ref for snapshot (avoids querySelector ambiguity: fix #10)
    const mvRef = useRef<ModelViewerEl>(null);

    // Reset on model swap
    useEffect(() => {
        setModelReady(false);
        setHasLaunched(false);
        setArUnavailable(false);
    }, [activeModelUrl]);

    // Track model-viewer load
    useEffect(() => {
        const el = mvRef.current;
        if (!el) return;
        const onLoad = () => setModelReady(true);
        el.addEventListener("load", onLoad);
        return () => el.removeEventListener("load", onLoad);
    }, [activeModelUrl]);

    // Track AR status/errors from model-viewer
    useEffect(() => {
        const el = mvRef.current as any;
        if (!el) return;

        const onArStatus = (e: any) => {
            const status = e?.detail?.status as string | undefined;
            if (status) setArStatus(status);
            if (status === "failed") setArUnavailable(true);
            if (status === "session-started") setHasLaunched(true);
        };

        const onError = () => {
            setArUnavailable(true);
        };

        el.addEventListener("ar-status", onArStatus);
        el.addEventListener("error", onError);
        return () => {
            el.removeEventListener("ar-status", onArStatus);
            el.removeEventListener("error", onError);
        };
    }, [activeModelUrl]);

    const launchAR = () => {
        const el = mvRef.current as any;
        if (!el) return;

        // Prefer letting model-viewer handle the native handoff. On some devices
        // `canActivateAR` may be false until a user gesture is fully processed.
        if (typeof el.activateAR === "function") {
            try {
                el.activateAR();
                if (navigator.vibrate) navigator.vibrate(20);
            } catch {
                setArUnavailable(true);
            }
        } else {
            setArUnavailable(true);
        }
    };

    const handleSnapshot = () => {
        // Fix #10: target the specific canvas inside this model-viewer element
        const el = mvRef.current;
        if (!el) return;
        const canvas = el.shadowRoot?.querySelector("canvas") ?? el.querySelector("canvas");
        if (canvas instanceof HTMLCanvasElement) {
            const link = document.createElement("a");
            link.download = `ar-snapshot-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Coaching overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
                <div className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-4 text-center">
                    {arUnavailable
                        ? "AR not available on this device"
                        : arStatus
                            ? `AR status: ${arStatus}`
                            : hasLaunched
                                ? "AR launched — check your camera"
                                : "Tap below to place in your space"}
                </div>
            </div>

            {/* Snapshot button */}
            <button
                onClick={handleSnapshot}
                className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
                aria-label="Take Snapshot"
            >
                <Camera className="w-5 h-5" />
            </button>

            {/* ---------- model-viewer (full-screen, NOT hidden) ----------
                This is the primary AR surface. model-viewer renders the 3D
                preview and delegates AR activation to the platform.
            */}
            <model-viewer
                ref={mvRef}
                src={activeModelUrl}
                ios-src={activeUsdzUrl ?? undefined}
                alt="3D model in AR"
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="auto"
                ar-placement="floor"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                shadow-softness="1"
                exposure="1"
                environment-image="neutral"
                loading="eager"
                reveal="auto"
                style={{
                    width: "100%",
                    flex: 1,
                    backgroundColor: "#000",
                    ["--poster-color" as string]: "#000",
                }}
            >
                {/* Slot: AR button rendered by model-viewer */}
                <button
                    slot="ar-button"
                    onClick={launchAR}
                    disabled={!modelReady}
                    className="absolute bottom-28 left-1/2 -translate-x-1/2 px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-xl disabled:opacity-40 transition-all active:scale-95"
                    aria-label="Launch AR"
                >
                    {modelReady ? "View in your space →" : "Preparing…"}
                </button>
            </model-viewer>

            {/* Related products switcher */}
            {related3DProducts.length > 0 && (
                <div className="absolute bottom-8 left-0 right-0 z-20 px-4 pointer-events-none">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x pointer-events-auto">
                        {/* Current product chip */}
                        <button
                            onClick={() => {
                                setActiveModelUrl(modelUrl);
                                setActiveUsdzUrl(usdzUrl ?? null);
                            }}
                            className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${activeModelUrl === modelUrl
                                ? "border-amber-500 ring-2 ring-amber-500/50"
                                : "border-white/20 opacity-80"
                                }`}
                        >
                            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-[10px] text-white font-bold text-center p-1">
                                Main
                            </div>
                        </button>

                        {related3DProducts.map((prod) => (
                            <button
                                key={prod.id}
                                onClick={() => {
                                    setActiveModelUrl(prod.modelUrl);
                                    setActiveUsdzUrl(null);
                                }}
                                className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${activeModelUrl === prod.modelUrl
                                    ? "border-amber-500 ring-2 ring-amber-500/50"
                                    : "border-white/20 opacity-80"
                                    }`}
                            >
                                <Image
                                    src={prod.image}
                                    alt={prod.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5">
                                    {prod.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

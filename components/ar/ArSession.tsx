"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, AlertCircle, RefreshCcw, Smartphone } from "lucide-react";
import { toast } from "sonner";

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
    onTriggerFallback?: () => void; // New prop to switch to RoomVisualizerClient
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
    onTriggerFallback,
}: ArSessionProps) {
    const [activeModelUrl, setActiveModelUrl] = useState(modelUrl);
    const [activeUsdzUrl, setActiveUsdzUrl] = useState(usdzUrl ?? null);
    const [hasLaunched, setHasLaunched] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [arUnavailable, setArUnavailable] = useState(false);
    const [arErrorDetail, setArErrorDetail] = useState<string | null>(null);
    const [arStatus, setArStatus] = useState<string | null>(null);

    const mvRef = useRef<ModelViewerEl>(null);

    // Ensure model-viewer is loaded dynamically to avoid SSR crash.
    useEffect(() => {
        import("@google/model-viewer").catch(() => null);
    }, []);

    const models = useMemo(() => {
        const main = { id: "__main__", name: "Main", modelUrl, usdzUrl: usdzUrl ?? null, image: "" };
        const rest = related3DProducts.map((p) => ({
            id: p.id,
            name: p.name,
            modelUrl: p.modelUrl,
            usdzUrl: null as string | null,
            image: p.image,
        }));
        return [main, ...rest];
    }, [modelUrl, related3DProducts, usdzUrl]);

    // Reset on model swap
    useEffect(() => {
        setModelReady(false);
        setHasLaunched(false);
        setArUnavailable(false);
        setArErrorDetail(null);
        setArStatus(null);
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
            if (status) {
                setArStatus(status);
                // Trigger professional toasts based on status changes
                if (status === "session-started") {
                    setHasLaunched(true);
                    toast.success("AR Session Started", {
                        description: "Point your camera at a flat, well-lit surface.",
                        duration: 4000
                    });
                } else if (status === "failed") {
                    setArUnavailable(true);
                    setArErrorDetail("Your device or browser does not support the required AR services.");
                    toast.error("AR Launch Failed", {
                        description: "Could not initialize AR engine.",
                    });
                } else if (status === "not-presenting") {
                    // User closed the AR view
                    if (hasLaunched) {
                        toast.info("AR Session Ended", {
                            description: "Returned to 3D preview."
                        });
                        setHasLaunched(false);
                    }
                }
            }
        };

        const onError = (e: any) => {
            console.error("Model-viewer error:", e);
            setArUnavailable(true);
            setArErrorDetail("Failed to load 3D model resources. Ensure your connection is stable.");
        };

        el.addEventListener("ar-status", onArStatus);
        el.addEventListener("error", onError);
        return () => {
            el.removeEventListener("ar-status", onArStatus);
            el.removeEventListener("error", onError);
        };
    }, [activeModelUrl, hasLaunched]);

    // Prevent background scrolling while AR Session is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleSnapshot = () => {
        const el = mvRef.current;
        if (!el) return;
        const canvas = el.shadowRoot?.querySelector("canvas") ?? el.querySelector("canvas");
        if (canvas instanceof HTMLCanvasElement) {
            const link = document.createElement("a");
            link.download = `ar-snapshot-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col overscroll-none">
            {/* Minimal Header Stats Layer */}
            {!arUnavailable && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
                    <div className="text-white bg-black/50 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium backdrop-blur-md border border-white/10 text-center">
                        {arStatus === "presenting"
                            ? "AR Active"
                            : hasLaunched
                                ? "Waiting for surface..."
                                : "Interactive 3D Preview"}
                    </div>
                </div>
            )}

            {/* Critical AR Error Overlay */}
            {arUnavailable && (
                <div className="absolute inset-0 z-[60] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-light tracking-tight text-white mb-3">
                                AR Unsupported
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                                {arErrorDetail || "We couldn't launch the augmented reality experience. Your device may lack the necessary sensors or software updates."}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                {onTriggerFallback && (
                                    <button
                                        onClick={onTriggerFallback}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-colors"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        Switch to Photo Mode
                                    </button>
                                )}
                                <button
                                    onClick={() => setArUnavailable(false)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    Return to 3D Preview
                                </button>
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="w-full mt-2 text-zinc-500 text-xs uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleSnapshot}
                className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
                aria-label="Take Snapshot"
            >
                <Camera className="w-5 h-5" />
            </button>

            <model-viewer
                ref={mvRef}
                src={activeModelUrl}
                ios-src={activeUsdzUrl ?? undefined}
                alt="3D model in AR"
                ar
                ar-modes="scene-viewer webxr quick-look"
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
                <button
                    slot="ar-button"
                    disabled={!modelReady}
                    className="absolute bottom-28 left-1/2 -translate-x-1/2 px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-xl disabled:opacity-40 transition-all active:scale-95"
                    aria-label="Launch AR"
                >
                    {modelReady ? "View in your space →" : "Preparing…"}
                </button>
            </model-viewer>

            {related3DProducts.length > 0 && (
                <div className="absolute bottom-8 left-0 right-0 z-20 px-4 pointer-events-none">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x pointer-events-auto">
                        {models.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => {
                                    setActiveModelUrl(m.modelUrl);
                                    setActiveUsdzUrl(m.usdzUrl);
                                }}
                                className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${activeModelUrl === m.modelUrl
                                    ? "border-amber-500 ring-2 ring-amber-500/50"
                                    : "border-white/20 opacity-80"
                                    }`}
                            >
                                {m.id === "__main__" ? (
                                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-[10px] text-white font-bold text-center p-1">
                                        Main
                                    </div>
                                ) : (
                                    <>
                                        <Image
                                            src={m.image}
                                            alt={m.name}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5">
                                            {m.name}
                                        </div>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

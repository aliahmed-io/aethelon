"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Box, AlertCircle } from "lucide-react";
import "@google/model-viewer";

interface ARProduct {
    id: string;
    name: string;
    price: number;
    modelUrl: string;
    usdzUrl?: string | null;
    images: string[];
}

interface MobileARViewerProps {
    /** Pre-selected product (from ?id= param). If null, shows picker. */
    product: ARProduct | null;
    /** All AR-capable products for picker */
    allProducts: ARProduct[];
}

// Fix #7: model-viewer element type that exposes AR methods
type ModelViewerEl = HTMLElement & {
    activateAR(): void;
    canActivateAR: boolean;
};

/** Returns true if the device is iOS */
function isIOS() {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function MobileARViewer({ product: initialProduct, allProducts }: MobileARViewerProps) {
    const [selected, setSelected] = useState<ARProduct | null>(initialProduct);
    const [showPicker, setShowPicker] = useState(!initialProduct);
    const [iOSWarning, setIoSWarning] = useState(false);
    // Fix #8: separate state for when device is iOS but no USDZ available
    const [iOSNoUsdz, setIOSNoUsdz] = useState(false);
    const [arLaunched, setArLaunched] = useState(false);
    const [arUnavailable, setArUnavailable] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const mvRef = useRef<ModelViewerEl>(null);

    // Show iOS caveat once (only when USDZ is present)
    useEffect(() => {
        if (isIOS() && selected) {
            if (selected.usdzUrl) {
                const seen = sessionStorage.getItem("ar-ios-warn");
                if (!seen) {
                    setIoSWarning(true);
                    sessionStorage.setItem("ar-ios-warn", "1");
                }
            } else {
                // Fix #8: iOS user, but no USDZ — warn them explicitly
                setIOSNoUsdz(true);
            }
        } else {
            setIOSNoUsdz(false);
        }
    }, [selected]);

    // Reset ready state on product change
    useEffect(() => {
        setModelReady(false);
        setArLaunched(false);
        setArUnavailable(false);
    }, [selected?.id]);

    // Fix #7: Attach model-viewer load event
    useEffect(() => {
        const el = mvRef.current;
        if (!el) return;
        const onLoad = () => setModelReady(true);
        el.addEventListener("load", onLoad);
        return () => el.removeEventListener("load", onLoad);
    }, [selected?.id]);

    const launchAR = () => {
        const el = mvRef.current;
        if (!el) return;

        // Fix #6: guard with canActivateAR before calling activateAR
        if (typeof el.activateAR === "function" && el.canActivateAR) {
            el.activateAR();
            setArLaunched(true);
        } else {
            setArUnavailable(true);
        }
    };

    /* ── Picker state ─────────────────────────────────────────────────── */
    if (showPicker || !selected) {
        return (
            <div
                className="min-h-screen flex flex-col"
                style={{ background: "#0A0805", color: "#EDE0CC" }}
            >
                {/* Top bar */}
                <header
                    className="flex items-center justify-between px-5 py-5 border-b"
                    style={{ borderColor: "#2A1E14" }}
                >
                    <Link
                        href="/ai-vision"
                        className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest"
                        style={{ color: "#9A7A5C" }}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </Link>
                    <p className="text-[11px] font-mono uppercase tracking-[0.3em]" style={{ color: "#AB7E22" }}>
                        AR Try-On
                    </p>
                </header>

                <div className="flex-1 px-5 pt-8">
                    <h1 className="text-2xl font-light tracking-wide uppercase mb-2" style={{ color: "#EDE0CC" }}>
                        Place in your space
                    </h1>
                    <p className="text-sm font-light mb-8" style={{ color: "#9A7A5C" }}>
                        Choose a piece — then point your camera at the floor.
                    </p>

                    {allProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <Box className="w-10 h-10" style={{ color: "#57412A" }} />
                            <p className="text-sm" style={{ color: "#9A7A5C" }}>
                                No 3D models available yet.
                            </p>
                            <p className="text-xs font-mono" style={{ color: "#57412A" }}>
                                Upload a .glb model in the admin dashboard to enable AR.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {allProducts.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setSelected(p);
                                        setShowPicker(false);
                                    }}
                                    className="relative overflow-hidden text-left transition-all duration-200 active:scale-95"
                                    style={{ border: "1px solid #2A1E14", background: "#131009" }}
                                >
                                    <div className="aspect-square relative">
                                        {p.images[0] ? (
                                            <Image
                                                src={p.images[0]}
                                                alt={p.name}
                                                fill
                                                sizes="50vw"
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Box className="w-8 h-8" style={{ color: "#57412A" }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-3 py-2" style={{ borderTop: "1px solid #2A1E14" }}>
                                        <p className="text-xs font-light line-clamp-2" style={{ color: "#EDE0CC" }}>
                                            {p.name}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── AR viewer state ──────────────────────────────────────────────── */
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: "#0A0805", color: "#EDE0CC" }}
        >
            {/* Top bar */}
            <header
                className="flex items-center justify-between px-5 py-5 border-b flex-shrink-0"
                style={{ borderColor: "#2A1E14" }}
            >
                <button
                    onClick={() => setShowPicker(true)}
                    className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest"
                    style={{ color: "#9A7A5C" }}
                >
                    <ChevronLeft className="w-4 h-4" /> Choose piece
                </button>
                <p className="text-[11px] font-mono uppercase tracking-[0.3em]" style={{ color: "#AB7E22" }}>
                    AR Try-On
                </p>
            </header>

            {/* iOS caveat (only when USDZ exists) */}
            {iOSWarning && (
                <div
                    className="mx-5 mt-4 px-4 py-3 flex items-start gap-3 text-xs"
                    style={{ border: "1px solid #57412A", background: "#1C1510", color: "#9A7A5C" }}
                >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#AB7E22" }} />
                    <span>
                        Full AR works best on Android. On iOS, the model opens in 3D preview mode.{" "}
                        <button onClick={() => setIoSWarning(false)} className="underline" style={{ color: "#AB7E22" }}>
                            Dismiss
                        </button>
                    </span>
                </div>
            )}

            {/* Fix #8: iOS with no USDZ model */}
            {iOSNoUsdz && (
                <div
                    className="mx-5 mt-4 px-4 py-3 flex items-start gap-3 text-xs"
                    style={{ border: "1px solid #57412A", background: "#1C1510", color: "#9A7A5C" }}
                >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#AB7E22" }} />
                    <span>
                        iOS AR requires a USDZ model — not yet available for this piece.
                        Try on an Android device for the full AR experience.
                    </span>
                </div>
            )}

            {/* AR unavailable notice */}
            {arUnavailable && (
                <div
                    className="mx-5 mt-4 px-4 py-3 flex items-start gap-3 text-xs"
                    style={{ border: "1px solid #57412A", background: "#1C1510", color: "#9A7A5C" }}
                >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#AB7E22" }} />
                    <span>
                        AR is not supported on this browser. Try Chrome on Android or Safari on iOS.
                    </span>
                </div>
            )}

            {/* Product preview + info */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
                {/* Product image */}
                <div
                    className="relative w-56 h-56 flex-shrink-0"
                    style={{ border: "1px solid #2A1E14", background: "#131009" }}
                >
                    {selected.images[0] ? (
                        <Image
                            src={selected.images[0]}
                            alt={selected.name}
                            fill
                            sizes="224px"
                            className="object-contain p-4"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Box className="w-12 h-12" style={{ color: "#57412A" }} />
                        </div>
                    )}
                </div>

                {/* Product info */}
                <div className="text-center">
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: "#AB7E22" }}>
                        Selected piece
                    </p>
                    <h2 className="text-xl font-light tracking-wide uppercase mb-1" style={{ color: "#EDE0CC" }}>
                        {selected.name}
                    </h2>

                    {!modelReady && (
                        <p className="text-xs font-mono mt-2" style={{ color: "#57412A" }}>
                            Loading 3D model…
                        </p>
                    )}
                </div>

                {/* Instructions */}
                {!arLaunched && !arUnavailable && (
                    <ol className="text-sm font-light space-y-2 text-center max-w-xs" style={{ color: "#9A7A5C" }}>
                        <li>1 · Tap the button below</li>
                        <li>2 · Point your camera at the floor</li>
                        <li>3 · Tap to place the piece</li>
                    </ol>
                )}

                {arLaunched && (
                    <p className="text-xs font-mono text-center" style={{ color: "#9A7A5C" }}>
                        AR launched — check your camera view
                    </p>
                )}
            </div>

            {/* CTA */}
            <div className="px-6 pb-10 flex flex-col gap-3 flex-shrink-0">
                {/* Fix #8: disable button on iOS without USDZ */}
                <button
                    onClick={launchAR}
                    disabled={!modelReady || iOSNoUsdz}
                    className="w-full py-5 text-[11px] font-mono uppercase tracking-[0.25em] transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-3"
                    style={{
                        border: `1px solid ${modelReady && !iOSNoUsdz ? "#AB7E22" : "#2A1E14"}`,
                        background: modelReady && !iOSNoUsdz ? "#AB7E22" : "transparent",
                        color: modelReady && !iOSNoUsdz ? "#0A0805" : "#57412A",
                    }}
                    aria-label="Launch AR experience"
                >
                    {iOSNoUsdz ? "iOS AR not available for this piece" : modelReady ? "View in your space →" : "Preparing model…"}
                </button>

                <Link
                    href={`/shop/${selected.id}`}
                    className="w-full py-3 text-[10px] font-mono uppercase tracking-[0.25em] text-center transition-colors"
                    style={{ border: "1px solid #2A1E14", color: "#9A7A5C" }}
                >
                    View product →
                </Link>
            </div>

            {/* Fix #7: Hidden model-viewer with all required AR attributes.
                camera-controls is required for model-viewer to fully initialize
                and report canActivateAR correctly. */}
            <model-viewer
                ref={mvRef}
                src={selected.modelUrl}
                ios-src={selected.usdzUrl ?? undefined}
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="auto"
                ar-placement="floor"
                camera-controls
                shadow-intensity="1"
                loading="eager"
                reveal="auto"
                style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}
            />
        </div>
    );
}

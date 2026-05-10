"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Loader2,
    Sparkles,
    Smartphone,
    Sun,
    Moon,
    Lightbulb,
    ChevronUp,
    ShoppingCart,
    ImageIcon,
    Upload,
    X,
} from "lucide-react";
import "@google/model-viewer";
import { formatPrice } from "@/lib/utils";
import { useCapabilities } from "@/components/ar/useCapabilities";
import type { VisualizerSharedProps } from "@/components/visualizer/shared-props";
import type { LightingMode, VisualizerProduct } from "@/components/visualizer/types";
import { ROOM_PRESETS } from "@/components/visualizer/types";

const ArSessionLazy = dynamic(
    () => import("@/components/ar/ArSession").then((m) => m.ArSession),
    { ssr: false }
);

function getExposureForMode(mode: LightingMode): string {
    switch (mode) {
        case "day":
            return "1.2";
        case "night":
            return "0.4";
        case "studio":
            return "1.8";
        default:
            return "1";
    }
}

function getShadowIntensityForMode(mode: LightingMode): string {
    switch (mode) {
        case "day":
            return "1";
        case "night":
            return "0.3";
        case "studio":
            return "1.5";
        default:
            return "1";
    }
}

export function MobileVisualizer({
    products,
    allProducts,
    selectedProduct,
    setSelectedProduct,
    roomBackground,
    setRoomBackground,
    activeRoomUrl,
    customRoomUrl,
    handleRoomUpload,
    lightingMode,
    setLightingMode,
    modelScale,
    setModelScale,
    analysisResult,
    onApplyAiSettings,
    isAnalyzing,
}: VisualizerSharedProps) {
    // Fix #3: gate on isMobile broadly, not WebXR flag — model-viewer handles
    // per-platform AR capability (Scene Viewer / Quick Look / WebXR) internally.
    const { isMobile } = useCapabilities();
    const [isArOpen, setIsArOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isRoomPickerOpen, setIsRoomPickerOpen] = useState(false);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false); // AI Panel State
    const [isModelLoading, setIsModelLoading] = useState(false);
    const viewerRef = useRef<HTMLElement>(null);
    const uploadRef = useRef<HTMLInputElement>(null);

    // Auto-open AI panel when analysis completes
    useEffect(() => {
        if (analysisResult) {
            setIsAiPanelOpen(true);
        }
    }, [analysisResult]);

    // model-viewer load events
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        const handleLoad = () => setIsModelLoading(false);
        const handleError = () => setIsModelLoading(false);

        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("error", handleError);

        return () => {
            viewer.removeEventListener("load", handleLoad);
            viewer.removeEventListener("error", handleError);
        };
    }, [selectedProduct]);

    useEffect(() => {
        if (selectedProduct) setIsModelLoading(true);
    }, [selectedProduct?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-select first product if none selected
    useEffect(() => {
        if (!selectedProduct && products.length > 0) {
            setSelectedProduct(products[0]);
        }
    }, [products, selectedProduct, setSelectedProduct]);

    const lightingCycle: LightingMode[] = ["day", "night", "studio"];
    const cycleLighting = () => {
        const idx = lightingCycle.indexOf(lightingMode);
        setLightingMode(lightingCycle[(idx + 1) % lightingCycle.length]);
    };

    const LightingIcon =
        lightingMode === "day" ? Sun : lightingMode === "night" ? Moon : Lightbulb;

    // Build related products for AR switcher
    const related3DProducts = allProducts
        .filter((p) => p.id !== selectedProduct?.id)
        .slice(0, 6)
        .map((p) => ({
            id: p.id,
            name: p.name,
            modelUrl: p.modelUrl,
            image: p.images[0] ?? "",
        }));

    return (
        <div className="h-[100dvh] flex flex-col bg-background text-foreground relative">
            {/* ── AR Session Overlay ─────────────────────────────────── */}
            {isArOpen && selectedProduct && (
                <div className="fixed inset-0 z-50">
                    <button
                        onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
                            setIsArOpen(false);
                        }}
                        className="absolute top-4 right-4 z-[60] p-2.5 rounded-full bg-black/60 text-white"
                        aria-label="Close AR"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <ArSessionLazy
                        modelUrl={selectedProduct.modelUrl}
                        usdzUrl={selectedProduct.usdzUrl}
                        related3DProducts={related3DProducts}
                        onClose={() => setIsArOpen(false)}
                    />
                </div>
            )}

            {/* ── AI Results Panel (Mobile Brain) ───────────────────── */}
            {isAiPanelOpen && analysisResult && (
                <div className="absolute top-16 left-4 right-4 z-40 bg-background/95 backdrop-blur-md border border-border rounded-sm shadow-2xl p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 text-accent">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">
                                AI Analysis
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsAiPanelOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-muted/50 p-3 rounded-sm border border-border/50">
                            <p className="text-sm leading-relaxed text-foreground">
                                {analysisResult.placementAdvice}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 border border-border rounded-sm">
                                <span className="text-[10px] uppercase text-muted-foreground block mb-1">
                                    Style Match
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent"
                                            style={{
                                                width: `${analysisResult.styleCompatibility}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono">
                                        {analysisResult.styleCompatibility}%
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onApplyAiSettings();
                                    setIsAiPanelOpen(false);
                                }}
                                className="p-2 border border-accent/30 bg-accent/5 hover:bg-accent/10 rounded-sm flex flex-col items-center justify-center text-center gap-1 transition-colors"
                            >
                                <span className="text-[10px] uppercase text-accent font-semibold">
                                    Apply Lighting
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {analysisResult.lightingMode}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Top Bar ────────────────────────────────────────────── */}
            <header className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-background/95 backdrop-blur-sm z-10">
                <Link
                    href="/categories"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                    <ArrowLeft size={14} />
                    <span className="sr-only">Back</span>
                </Link>

                <div className="flex items-center gap-1.5 translate-x-3">
                    {/* Center Title roughly */}
                    <span className="text-sm font-display uppercase tracking-wider">
                        Visualizer
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Only show Brain button if we have a result or are analyzing */}
                    {(analysisResult || isAnalyzing) && (
                        <button
                            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                            className={`p-2 rounded-sm transition-colors ${isAiPanelOpen ? "bg-accent text-accent-foreground" : "hover:bg-muted text-accent"
                                } ${isAnalyzing ? "animate-pulse" : ""}`}
                            aria-label="AI Insights"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={cycleLighting}
                        className="p-2 rounded-sm hover:bg-muted transition-colors"
                        aria-label={`Current lighting: ${lightingMode}. Tap to change.`}
                    >
                        <LightingIcon className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>
            </header>

            {/* ── 3D Canvas ──────────────────────────────────────────── */}
            <main className="flex-1 relative overflow-hidden">
                {/* Room Background */}
                <div className="absolute inset-0">
                    <Image
                        src={activeRoomUrl}
                        alt={roomBackground.alt}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                    <div
                        className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${lightingMode === "night"
                            ? "bg-blue-950/40"
                            : lightingMode === "studio"
                                ? "bg-black/10"
                                : "bg-transparent"
                            }`}
                    />
                </div>

                {/* model-viewer or empty state */}
                {selectedProduct ? (
                    <div className="absolute inset-0 z-10">
                        {isModelLoading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                                <div className="flex items-center gap-2 bg-background/90 backdrop-blur px-4 py-2.5 rounded-full border border-border">
                                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                        Loading
                                    </span>
                                </div>
                            </div>
                        )}

                        <model-viewer
                            ref={viewerRef}
                            src={selectedProduct.modelUrl}
                            ios-src={selectedProduct.usdzUrl ?? undefined}
                            poster={selectedProduct.images[0] ?? undefined}
                            alt={`3D model of ${selectedProduct.name}`}
                            camera-controls
                            touch-action="pan-y"
                            auto-rotate
                            autoplay
                            interpolation-decay="200"
                            shadow-intensity={getShadowIntensityForMode(lightingMode)}
                            shadow-softness="1.2"
                            exposure={getExposureForMode(lightingMode)}
                            environment-image="neutral"
                            scale={`${modelScale} ${modelScale} ${modelScale}`}
                            reveal="auto"
                            loading="lazy"
                            ar
                            ar-modes="webxr scene-viewer quick-look"
                            ar-scale="auto"
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "transparent",
                                ["--poster-color" as string]: "transparent",
                            }}
                        >
                        </model-viewer>
                    </div>
                ) : (
                    <div className="absolute inset-0 z-10 flex items-center justify-center px-8">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                No 3D products available
                            </p>
                        </div>
                    </div>
                )}

                {/* Room Picker Button */}
                <button
                    onClick={() => setIsRoomPickerOpen(!isRoomPickerOpen)}
                    className="absolute top-3 left-3 z-20 p-2 rounded-sm bg-background/80 backdrop-blur border border-border"
                    aria-label="Change room"
                >
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Room Picker Dropdown */}
                {isRoomPickerOpen && (
                    <div className="absolute top-12 left-3 z-30 bg-background/95 backdrop-blur border border-border rounded-sm p-2 space-y-2 w-48">
                        {ROOM_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => {
                                    setRoomBackground(preset);
                                    setIsRoomPickerOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 p-1.5 rounded-sm text-left transition-colors ${roomBackground.id === preset.id &&
                                    !customRoomUrl
                                    ? "bg-accent/10 text-accent"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <div className="relative w-10 h-7 rounded-sm overflow-hidden flex-shrink-0">
                                    <Image
                                        src={preset.src}
                                        alt={preset.alt}
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                    />
                                </div>
                                <span className="text-xs truncate">
                                    {preset.label}
                                </span>
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                uploadRef.current?.click();
                                setIsRoomPickerOpen(false);
                            }}
                            className="w-full flex items-center gap-2 p-1.5 rounded-sm text-left hover:bg-muted text-xs text-muted-foreground"
                        >
                            <div className="w-10 h-7 rounded-sm border border-dashed border-border flex items-center justify-center flex-shrink-0 text-accent">
                                <Sparkles className="w-3 h-3" />
                            </div>
                            <span className="font-medium text-accent">Scan Room (AI)</span>
                        </button>
                        <input
                            ref={uploadRef}
                            type="file"
                            accept="image/*"
                            capture="environment" // Forces camera on mobile
                            onChange={handleRoomUpload}
                            className="hidden"
                        />
                    </div>
                )}
            </main>

            {/* ── Product Carousel ────────────────────────────────────── */}
            <div className="border-t border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
                {/* Toggle */}
                <button
                    onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                    className="w-full flex items-center justify-center py-2"
                    aria-label={isCatalogOpen ? "Collapse products" : "Expand products"}
                >
                    <ChevronUp
                        className={`w-4 h-4 text-muted-foreground transition-transform ${isCatalogOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {/* Selected Product Info + Actions */}
                {selectedProduct && (
                    <div className="px-4 pb-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {selectedProduct.name}
                            </p>
                            <p className="text-xs text-accent font-semibold">
                                {formatPrice(selectedProduct.price / 100)}
                            </p>
                        </div>

                        {/* AR Button — shown on all mobile devices.
                            model-viewer handles Scene Viewer / Quick Look / WebXR internally.
                            Fix #3: no longer gated behind isWebXrSupported. */}
                        {isMobile && (
                            <button
                                onClick={() => {
                                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
                                    setIsArOpen(true);
                                }}
                                className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                AR
                            </button>
                        )}

                        <Link
                            href={selectedProduct.isVaultExclusive ? `/vault/${selectedProduct.id}` : `/shop/${selectedProduct.id}`}
                            className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-medium"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            View
                        </Link>
                    </div>
                )}

                {/* Horizontal Scroll Product List */}
                {isCatalogOpen && (
                    <div className="pb-4 px-3 border-t border-border pt-3">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                            {products.map((product) => {
                                const isActive =
                                    selectedProduct?.id === product.id;
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() =>
                                            setSelectedProduct(product)
                                        }
                                        className={`flex-shrink-0 w-20 snap-start ${isActive ? "opacity-100" : "opacity-70"
                                            }`}
                                    >
                                        <div
                                            className={`relative w-20 h-20 rounded-sm overflow-hidden border-2 mb-1 ${isActive
                                                ? "border-accent"
                                                : "border-border"
                                                }`}
                                        >
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                    3D
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] truncate text-center">
                                            {product.name}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

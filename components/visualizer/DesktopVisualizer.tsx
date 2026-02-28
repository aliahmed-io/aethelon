"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Box, Move } from "lucide-react";
import { motion, useDragControls } from "framer-motion";
// Dynamically imported in useEffect — @google/model-viewer uses browser globals
// (self, customElements) at module-eval time which crashes SSR.
import { ProductCatalog } from "@/components/visualizer/ProductCatalog";
import { PropertiesPanel } from "@/components/visualizer/PropertiesPanel";
import type { VisualizerSharedProps } from "@/components/visualizer/shared-props";
import type { LightingMode } from "@/components/visualizer/types";

/** Map lighting mode to model-viewer environment-image values */
function getEnvironmentForMode(mode: LightingMode): string {
    switch (mode) {
        case "day":
            return "neutral";
        case "night":
            return "legacy";
        case "studio":
            return "neutral";
        default:
            return "neutral";
    }
}

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

export function DesktopVisualizer(props: VisualizerSharedProps) {
    const {
        products,
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
        categories,
        categoryFilter,
        setCategoryFilter,
    } = props;

    // Load model-viewer only on client — it references `self` at module level
    useEffect(() => {
        import("@google/model-viewer").catch(() => null);
    }, []);

    const viewerRef = useRef<HTMLElement>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [interactionMode, setInteractionMode] = useState<"rotate" | "move">("move");
    const dragConstraintsRef = useRef<HTMLDivElement>(null);

    // ── model-viewer attributes update ──────────────────────────────────
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

    // Set loading when product changes
    useEffect(() => {
        if (selectedProduct) {
            setIsModelLoading(true);
        }
    }, [selectedProduct?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="h-screen flex flex-col bg-background text-foreground">
            {/* ── Top Bar ────────────────────────────────────────────── */}
            <header className="h-16 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/categories"
                        className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft
                            size={14}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                        Back to Shop
                    </Link>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm font-display uppercase tracking-wider">
                            Room Visualizer
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        <Box className="w-3 h-3" />
                        <span>{products.length} 3D Models</span>
                    </div>
                </div>
            </header>

            {/* ── Main Layout ────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Product Catalog */}
                <aside className="w-80 border-r border-border bg-background/95 backdrop-blur-sm flex-shrink-0 overflow-hidden">
                    <ProductCatalog
                        products={products}
                        selectedProduct={selectedProduct}
                        onSelectProduct={setSelectedProduct}
                        categories={categories}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                    />
                </aside>

                {/* Center: 3D Canvas */}
                <main className="flex-1 relative overflow-hidden">
                    {/* Room Background */}
                    <div className="absolute inset-0" ref={dragConstraintsRef}>
                        <Image
                            src={activeRoomUrl}
                            alt={roomBackground.alt}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 60vw, 100vw"
                            priority
                        />
                        {/* Lighting overlay */}
                        <div
                            className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${lightingMode === "night"
                                ? "bg-blue-950/40"
                                : lightingMode === "studio"
                                    ? "bg-black/10"
                                    : "bg-transparent"
                                }`}
                        />
                    </div>

                    {/* model-viewer */}
                    {selectedProduct ? (
                        <>
                            {/* Mode Toggle */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex bg-background/80 backdrop-blur border border-border p-1 rounded-full shadow-md">
                                <button
                                    onClick={() => setInteractionMode("move")}
                                    className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${interactionMode === "move"
                                        ? "bg-accent text-accent-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    Move Pos
                                </button>
                                <button
                                    onClick={() => setInteractionMode("rotate")}
                                    className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${interactionMode === "rotate"
                                        ? "bg-accent text-accent-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    Rotate
                                </button>
                            </div>

                            <motion.div
                                drag={interactionMode === "move"}
                                dragConstraints={{ top: -2000, left: -2000, right: 2000, bottom: 2000 }}
                                dragElastic={0}
                                dragMomentum={false}
                                className={`absolute z-10 w-full h-full top-0 left-0 group ${interactionMode === "move" ? "cursor-grab active:cursor-grabbing" : ""
                                    }`}
                            >
                                {/* Drag Helper Text */}
                                {interactionMode === "move" && (
                                    <div
                                        className="absolute top-20 left-1/2 -translate-x-1/2 bg-transparent text-muted-foreground pointer-events-none flex items-center gap-2 z-20"
                                    >
                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-medium bg-background/50 backdrop-blur-sm px-2 py-1 rounded">
                                            Drag Model to Reposition
                                        </span>
                                    </div>
                                )}

                                {/* Loading Overlay */}
                                {isModelLoading && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-[2px] rounded-xl">
                                        <div className="flex flex-col items-center gap-3 bg-background/90 backdrop-blur px-6 py-4 rounded-sm border border-border shadow-lg">
                                            <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                                Loading 3D Model
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <model-viewer
                                    ref={viewerRef}
                                    src={selectedProduct.modelUrl}
                                    ios-src={selectedProduct.usdzUrl ?? undefined}
                                    alt={`3D model of ${selectedProduct.name}`}
                                    camera-controls
                                    disable-pan
                                    shadow-intensity={getShadowIntensityForMode(lightingMode)}
                                    shadow-softness="1"
                                    exposure={getExposureForMode(lightingMode)}
                                    environment-image={getEnvironmentForMode(lightingMode)}
                                    scale={`${modelScale} ${modelScale} ${modelScale}`}
                                    reveal="auto"
                                    loading="eager"
                                    interaction-prompt="none"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: "transparent",
                                        ["--poster-color" as string]: "transparent",
                                        pointerEvents: interactionMode === "move" ? "none" : "auto",
                                    }}
                                >
                                    {/* Progress Bar */}
                                    <div
                                        slot="progress-bar"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden"
                                    >
                                        <div className="h-full bg-accent transition-all duration-300" />
                                    </div>
                                </model-viewer>
                            </motion.div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                            <div className="text-center bg-background/80 backdrop-blur-xl border border-border p-12 rounded-sm max-w-md pointer-events-auto shadow-xl">
                                <Box className="w-12 h-12 text-accent mx-auto mb-4 opacity-60" />
                                <h2 className="font-display text-2xl mb-2 uppercase tracking-tight">
                                    Select a Product
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Choose a product from the catalog to see it
                                    rendered in 3D within this room environment.
                                    Rotate, zoom, and adjust lighting to
                                    visualize it perfectly.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Room Label */}
                    <div className="absolute bottom-4 left-4 z-20 bg-background/80 backdrop-blur border border-border px-3 py-1.5 rounded-sm">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            {customRoomUrl
                                ? "Your Room"
                                : roomBackground.label}
                        </p>
                    </div>
                </main>

                {/* Right: Properties Panel */}
                <aside className="w-80 border-l border-border bg-background/95 backdrop-blur-sm flex-shrink-0 overflow-hidden">
                    <PropertiesPanel
                        selectedProduct={selectedProduct}
                        lightingMode={lightingMode}
                        onLightingChange={setLightingMode}
                        modelScale={modelScale}
                        onScaleChange={setModelScale}
                        roomBackground={roomBackground}
                        onRoomChange={setRoomBackground}
                        customRoomUrl={customRoomUrl}
                        onRoomUpload={handleRoomUpload}
                        isAnalyzing={props.isAnalyzing}
                        analysisResult={props.analysisResult}
                        onApplyAiSettings={props.onApplyAiSettings}
                    />
                </aside>
            </div>
        </div>
    );
}

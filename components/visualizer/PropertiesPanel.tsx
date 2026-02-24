"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Sun,
    Moon,
    Lightbulb,
    Upload,
    ShoppingCart,
    ExternalLink,
    Minus,
    Plus,
    Loader2,
    Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type {
    VisualizerProduct,
    RoomPreset,
    LightingMode,
} from "@/components/visualizer/types";
import { ROOM_PRESETS } from "@/components/visualizer/types";

interface PropertiesPanelProps {
    selectedProduct: VisualizerProduct | null;
    lightingMode: LightingMode;
    onLightingChange: (mode: LightingMode) => void;
    modelScale: number;
    onScaleChange: (scale: number) => void;
    roomBackground: RoomPreset;
    onRoomChange: (preset: RoomPreset) => void;
    customRoomUrl: string | null;
    onRoomUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // AI
    isAnalyzing?: boolean;
    analysisResult?: {
        placementAdvice: string;
        lightingMode: "day" | "night" | "studio";
        styleCompatibility: number;
        colorHarmony: string;
    } | null;
    onApplyAiSettings?: () => void;
}

const LIGHTING_OPTIONS: { id: LightingMode; label: string; icon: typeof Sun }[] = [
    { id: "day", label: "Daylight", icon: Sun },
    { id: "night", label: "Evening", icon: Moon },
    { id: "studio", label: "Studio", icon: Lightbulb },
];

export function PropertiesPanel({
    selectedProduct,
    lightingMode,
    onLightingChange,
    modelScale,
    onScaleChange,
    roomBackground,
    onRoomChange,
    customRoomUrl,
    onRoomUpload,
    isAnalyzing,
    analysisResult,
    onApplyAiSettings,
}: PropertiesPanelProps) {
    const uploadRef = useRef<HTMLInputElement>(null);

    const incrementScale = () =>
        onScaleChange(Math.min(2, +(modelScale + 0.1).toFixed(1)));
    const decrementScale = () =>
        onScaleChange(Math.max(0.3, +(modelScale - 0.1).toFixed(1)));

    return (
        <div className="flex flex-col h-full">
            {/* Product Info */}
            <div className="p-6 border-b border-border">
                {selectedProduct ? (
                    <>
                        <h2 className="font-display text-xl mb-1 tracking-tight">
                            {selectedProduct.name}
                        </h2>
                        <p className="text-accent font-semibold text-lg mb-3">
                            {formatPrice(selectedProduct.price / 100)}
                        </p>
                        {selectedProduct.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedProduct.categories.map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-sm"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                            Select a product to preview
                        </p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* AI Insights */}
                {(analysisResult || isAnalyzing) && (
                    <section className="bg-accent/5 border border-accent/20 rounded-sm p-3 relative overflow-hidden">
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-2 text-accent">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                AI Insights
                            </span>
                        </div>
                        {analysisResult ? (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {analysisResult.placementAdvice}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest border-t border-accent/10 pt-2 mt-2">
                                    <span>Match: {analysisResult.styleCompatibility}%</span>
                                    <span>{analysisResult.colorHarmony}</span>
                                </div>
                                <button
                                    onClick={onApplyAiSettings}
                                    className="w-full mt-2 text-[10px] bg-accent/10 hover:bg-accent/20 text-accent font-medium py-1.5 rounded-sm transition-colors border border-accent/20"
                                >
                                    Apply Suggested Lighting
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Analyzing room environment...
                            </p>
                        )}
                    </section>
                )}

                {/* Lighting */}
                <section>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 block">
                        Lighting
                    </label>
                    <div className="flex bg-muted rounded-sm p-1">
                        {LIGHTING_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = lightingMode === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => onLightingChange(opt.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-sm transition-all ${isActive
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    aria-pressed={isActive}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="hidden lg:inline">
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Scale */}
                {selectedProduct && (
                    <section>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 block">
                            Scale ({Math.round(modelScale * 100)}%)
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={decrementScale}
                                disabled={modelScale <= 0.3}
                                className="p-2 rounded-sm border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease scale"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                                type="range"
                                min="0.3"
                                max="2"
                                step="0.1"
                                value={modelScale}
                                onChange={(e) =>
                                    onScaleChange(parseFloat(e.target.value))
                                }
                                className="flex-1 h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-accent"
                                aria-label="Model scale"
                            />
                            <button
                                onClick={incrementScale}
                                disabled={modelScale >= 2}
                                className="p-2 rounded-sm border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label="Increase scale"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </section>
                )}

                {/* Room Background */}
                <section>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 block">
                        Room Environment
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {ROOM_PRESETS.map((preset) => {
                            const isActive =
                                roomBackground.id === preset.id && !customRoomUrl;
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => onRoomChange(preset)}
                                    className={`relative aspect-[4/3] rounded-sm overflow-hidden border-2 transition-all ${isActive
                                        ? "border-accent ring-1 ring-accent/30"
                                        : "border-border hover:border-accent/50"
                                        }`}
                                    aria-label={preset.label}
                                    aria-pressed={isActive}
                                >
                                    <Image
                                        src={preset.src}
                                        alt={preset.alt}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                                        <p className="text-[8px] text-white font-medium truncate">
                                            {preset.label}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Upload Custom */}
                    <button
                        onClick={() => uploadRef.current?.click()}
                        className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-sm text-xs text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Upload your room
                    </button>
                    <input
                        ref={uploadRef}
                        type="file"
                        accept="image/*"
                        onChange={onRoomUpload}
                        className="hidden"
                        aria-label="Upload room photo"
                    />
                </section>
            </div>

            {/* Actions */}
            {selectedProduct && (
                <div className="p-6 border-t border-border bg-muted/20 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">
                            Price
                        </span>
                        <span className="font-display text-2xl text-foreground">
                            {formatPrice(selectedProduct.price / 100)}
                        </span>
                    </div>

                    <Link
                        href={`/shop/${selectedProduct.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3.5 rounded-sm hover:bg-foreground/90 transition-colors uppercase tracking-widest text-sm"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        View Product
                    </Link>
                </div>
            )}
        </div>
    );
}

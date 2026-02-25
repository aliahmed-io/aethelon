"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCapabilities } from "@/components/ar/useCapabilities";
import { DesktopVisualizer } from "@/components/visualizer/DesktopVisualizer";
import { MobileVisualizer } from "@/components/visualizer/MobileVisualizer";
import type {
    VisualizerProduct,
    LightingMode,
    RoomPreset,
} from "@/components/visualizer/types";
import { ROOM_PRESETS } from "@/components/visualizer/types";

import { toast } from "sonner";
import { analyzeRoomImage } from "@/app/actions/visualizer-ai";

interface RoomVisualizerClientProps {
    products: VisualizerProduct[];
    preselectedProductId?: string;
}

export function RoomVisualizerClient({
    products,
    preselectedProductId,
}: RoomVisualizerClientProps) {
    const { isMobile, loading: capsLoading } = useCapabilities();

    // ── State ───────────────────────────────────────────────────────────
    const [selectedProduct, setSelectedProduct] =
        useState<VisualizerProduct | null>(null);
    const [roomBackground, setRoomBackground] = useState<RoomPreset>(
        ROOM_PRESETS[0]
    );
    const [customRoomUrl, setCustomRoomUrl] = useState<string | null>(null);
    const [lightingMode, setLightingMode] = useState<LightingMode>("day");
    const [modelScale, setModelScale] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{
        placementAdvice: string;
        lightingMode: "day" | "night" | "studio";
        styleCompatibility: number;
        colorHarmony: string;
    } | null>(null);

    // ── Derived ─────────────────────────────────────────────────────────
    const categories = useMemo(() => {
        const map = new Map<string, string>();
        products.forEach((p) =>
            p.categories.forEach((c) => map.set(c.id, c.name))
        );
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!categoryFilter) return products;
        return products.filter((p) =>
            p.categories.some((c) => c.id === categoryFilter)
        );
    }, [products, categoryFilter]);

    // ── Deep-link: preselect product ────────────────────────────────────
    useEffect(() => {
        if (preselectedProductId) {
            const match = products.find((p) => p.id === preselectedProductId);
            if (match) setSelectedProduct(match);
        }
    }, [preselectedProductId, products]);

    // ── Room photo upload & AI Logic ────────────────────────────────────
    const handleRoomUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file type and size
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file (JPG, PNG)");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }

            const url = URL.createObjectURL(file);
            setCustomRoomUrl(url);

            // Trigger AI Analysis
            if (selectedProduct) {
                setIsAnalyzing(true);
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64 = reader.result as string;
                    try {
                        toast.info("Analyzing your room with Gemini AI...");
                        const result = await analyzeRoomImage(
                            base64,
                            selectedProduct.name,
                            selectedProduct.categories[0]?.name ?? "Furniture"
                        );
                        setAnalysisResult(result);
                        toast.success("Room Analyzed!", {
                            description: result.placementAdvice,
                            action: {
                                label: "Apply Lighting",
                                onClick: () => setLightingMode(result.lightingMode),
                            },
                        });
                    } catch (error) {
                        toast.error("Failed to analyze room.");
                        console.error(error);
                    } finally {
                        setIsAnalyzing(false);
                    }
                };
                reader.readAsDataURL(file);
            }
        },
        [selectedProduct]
    );

    const applyAiSettings = useCallback(() => {
        if (analysisResult) {
            setLightingMode(analysisResult.lightingMode);
            toast.success(`Applied ${analysisResult.lightingMode} lighting settings`);
        }
    }, [analysisResult]);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            if (customRoomUrl) URL.revokeObjectURL(customRoomUrl);
        };
    }, [customRoomUrl]);

    // ── Loading State ───────────────────────────────────────────────────
    if (capsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── Active room background URL ──────────────────────────────────────
    const activeRoomUrl = customRoomUrl ?? roomBackground.src;

    // ── Render Platform-Specific Experience ─────────────────────────────
    const sharedProps = {
        products: filteredProducts,
        allProducts: products,
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
        isAnalyzing,
        analysisResult,
        onApplyAiSettings: applyAiSettings,
    };

    if (isMobile) {
        // On mobile, hand off to the dedicated AR camera experience
        const arHref = selectedProduct ? `/ar?id=${selectedProduct.id}` : "/ar";
        // Use a client-side redirect via window.location for immediacy,
        // or render a redirect component that fires on mount
        return <MobileARRedirect href={arHref} />;
    }

    return <DesktopVisualizer {...sharedProps} />;
}

/** Immediate redirect to the mobile AR page. Separate component so hooks above still run. */
function MobileARRedirect({ href }: { href: string }) {
    useEffect(() => {
        window.location.replace(href);
    }, [href]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );
}


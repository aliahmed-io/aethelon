"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Box, Smartphone, Sparkles, ScanFace } from "lucide-react";
import { ArWrapper } from "@/components/ar/ArWrapper";
import { ThreeDViewerLazy } from "@/components/product/ProductClientWrappers";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
    images: string[];
    productName: string;
    modelUrl?: string | null;
}

export function ProductGallery({ images, productName, modelUrl }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [is3DOpen, setIs3DOpen] = useState(false);

    // Filter out empty strings if any
    const validImages = images.filter(Boolean);

    if (validImages.length === 0) return null;

    return (
        <div className="w-full space-y-6">
            {/* Main Image Container */}
            <div className="relative aspect-square md:aspect-[4/5] lg:aspect-square xl:aspect-[4/3] w-full overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900 shadow-2xl group">
                <Image
                    src={validImages[selectedIndex]}
                    alt={`${productName} view ${selectedIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Floating Actions Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 w-max max-w-[90%] overflow-x-auto scrollbar-hide p-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">

                    {/* 3D Preview Trigger */}
                    {modelUrl && (
                        <Dialog open={is3DOpen} onOpenChange={setIs3DOpen}>
                            <DialogTrigger asChild>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-white text-sm font-medium transition-all border border-white/5 whitespace-nowrap">
                                    <Box size={16} className="text-amber-500" />
                                    <span>3D Preview</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] bg-zinc-950 border-white/10 p-0 overflow-hidden">
                                <div className="w-full h-full relative">
                                    <ThreeDViewerLazy
                                        modelUrl={modelUrl}
                                        images={validImages}
                                        altTitle={productName}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
                                        onClick={() => setIs3DOpen(false)}
                                    >
                                        <span className="sr-only">Close</span>
                                        ✕
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* AI Try On (Mock Trigger for now) */}
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-white text-sm font-medium transition-all border border-white/5 whitespace-nowrap">
                        <ScanFace size={16} className="text-amber-500" />
                        <span>AI Try On</span>
                    </button>

                    {/* AR Button (Mobile Only via ArWrapper, but represented here for desktop visual unity if needed) */}
                    <div className="md:hidden">
                        {/* ArWrapper injects its own button fixed, but we can have a specific trigger here if we refactor ArWrapper. 
                           For now, we leave the fixed ArWrapper for mobile as it controls the session best. 
                           On Desktop, AR isn't typical. */}
                    </div>
                </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {validImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={cn(
                            "relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all snap-start",
                            selectedIndex === idx
                                ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105"
                                : "border-transparent opacity-60 hover:opacity-100"
                        )}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="100px"
                        />
                    </button>
                ))}
            </div>

            {/* Mobile AR Wrapper Injection */}
            {modelUrl && <ArWrapper modelUrl={modelUrl} productName={productName} />}
        </div>
    );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Box, Smartphone, Sparkles, ScanFace, X, ZoomIn } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load globally to avoid heavy AR scripts on initial load
const ArWrapper = dynamic(
    () => import("@/components/ar/ArWrapper").then((m) => m.ArWrapper),
    { ssr: false }
);
import { ThreeDViewerLazy } from "@/components/product/ProductClientWrappers";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
    images: string[];
    productName: string;
    modelUrl?: string | null;
    related3DProducts?: {
        id: string;
        name: string;
        modelUrl: string;
        image: string;
    }[];
}

export function ProductGallery({ images, productName, modelUrl, related3DProducts }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [is3DOpen, setIs3DOpen] = useState(false);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    // Filter out empty strings if any
    const validImages = images.filter(Boolean);

    if (validImages.length === 0) return null;

    return (
        <div className="w-full flex flex-col-reverse md:flex-row gap-4 lg:gap-8">
            {/* Thumbnail Strip (Left on Desktop, Bottom on Mobile) */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-hide py-1 px-1 snap-x md:w-24 lg:w-28 flex-shrink-0">
                {validImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIndex(idx);
                        }}
                        className={cn(
                            "relative w-20 h-20 md:w-full md:aspect-square flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start",
                            selectedIndex === idx
                                ? "border-amber-500 shadow-md ring-1 ring-amber-500/20"
                                : "border-transparent opacity-70 hover:opacity-100 hover:border-neutral-200"
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

            {/* Main Image Container */}
            <div className="flex-1 w-full relative group">
                {/* Zoom Dialog Trigger */}
                <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                    <DialogTrigger asChild>
                        <div
                            className="relative aspect-square md:aspect-[4/5] lg:aspect-square w-full overflow-hidden rounded-[24px] md:rounded-[32px] border border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-zinc-900 shadow-sm cursor-zoom-in group"
                            onClick={() => setIsZoomOpen(true)}
                        >
                            <Image
                                src={validImages[selectedIndex]}
                                alt={`${productName} view ${selectedIndex + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                                quality={100}
                            />

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-md p-2 rounded-full text-white">
                                <ZoomIn size={20} />
                            </div>

                            {/* Floating Actions Overlay */}
                            <div
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 w-max max-w-[90%] overflow-x-auto scrollbar-hide p-1.5 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >

                                {/* 3D Preview Trigger - Separate Dialog Nested Logic handled by excluding trigger */}
                                {modelUrl && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-4 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-white border border-white/5 gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIs3DOpen(true);
                                        }}
                                    >
                                        <Box size={16} className="text-amber-500" />
                                        <span>3D Preview</span>
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-4 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-white border border-white/5 gap-2"
                                    onClick={(e) => e.stopPropagation()} // Placeholder action
                                >
                                    <ScanFace size={16} className="text-amber-500" />
                                    <span>Try On</span>
                                </Button>
                            </div>
                        </div>
                    </DialogTrigger>

                    {/* Zoom Content */}
                    <DialogContent className="max-w-[95vw] w-full h-[95vh] bg-black/95 border-none p-0 overflow-hidden flex flex-col items-center justify-center outline-none">
                        <div className="sr-only">
                            <DialogTitle>Zoom View - {productName}</DialogTitle>
                        </div>
                        <div className="relative w-full h-full p-4 md:p-12 flex items-center justify-center">
                            <Image
                                src={validImages[selectedIndex]}
                                alt={`${productName} zoomed`}
                                fill
                                className="object-contain"
                                quality={100}
                                unoptimized
                                priority
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10 rounded-full w-12 h-12"
                                onClick={() => setIsZoomOpen(false)}
                            >
                                <X size={24} />
                                <span className="sr-only">Close</span>
                            </Button>

                            {/* Navigation in Zoom */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                                {validImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedIndex(idx)}
                                        className={cn(
                                            "w-3 h-3 rounded-full transition-all",
                                            selectedIndex === idx ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"
                                        )}
                                        aria-label={`Go to image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 3D Viewer Dialog (Separate from Zoom) */}
                <Dialog open={is3DOpen} onOpenChange={setIs3DOpen}>
                    <DialogContent className="max-w-4xl w-[90vw] h-[80vh] bg-zinc-950 border-white/10 p-0 overflow-hidden">
                        <div className="sr-only">
                            <DialogTitle>3D View - {productName}</DialogTitle>
                        </div>
                        <div className="w-full h-full relative">
                            {modelUrl && (
                                <ThreeDViewerLazy
                                    modelUrl={modelUrl}
                                    images={validImages}
                                    altTitle={productName}
                                />
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
                                onClick={() => setIs3DOpen(false)}
                            >
                                <X size={24} />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mobile AR Wrapper Injection */}
            {modelUrl && <ArWrapper modelUrl={modelUrl} productName={productName} related3DProducts={related3DProducts} />}
        </div>
    );
}

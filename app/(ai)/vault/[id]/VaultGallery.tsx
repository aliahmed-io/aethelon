"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Box, ScanFace, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThreeDViewerLazy } from "@/components/product/ProductClientWrappers";

interface VaultGalleryProps {
    productId: string;
    images: string[];
    productName: string;
    modelUrl?: string | null;
}

export function VaultGallery({ productId, images, productName, modelUrl }: VaultGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [is3DOpen, setIs3DOpen] = useState(false);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const validImages = images.filter(Boolean);
    if (validImages.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Main Image Container */}
            <div className="w-full relative group">
                <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                    <DialogTrigger asChild>
                        <div
                            className="relative w-full aspect-[3/4] max-w-md mx-auto overflow-hidden cursor-zoom-in group"
                            onClick={() => setIsZoomOpen(true)}
                        >
                            <Image
                                src={validImages[selectedIndex]}
                                alt={`${productName} view ${selectedIndex + 1}`}
                                fill
                                className="object-contain transition-transform duration-700 group-hover:scale-105"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                quality={100}
                            />

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full" style={{ background: "var(--vault-gold)", color: "var(--vault-bg)" }}>
                                <ZoomIn size={20} />
                            </div>

                            {/* Floating Actions Overlay */}
                            <div
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 w-max max-w-[90%] overflow-x-auto scrollbar-hide p-1.5 backdrop-blur-md border rounded-full shadow-lg"
                                style={{ background: "rgba(28,21,16,0.6)", borderColor: "rgba(171,126,34,0.3)" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {modelUrl && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-4 rounded-full gap-2 transition-colors hover:bg-white/10"
                                        style={{ color: "var(--vault-gold)" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIs3DOpen(true);
                                        }}
                                    >
                                        <Box size={16} />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">3D</span>
                                    </Button>
                                )}

                                {modelUrl && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/ar?id=${productId}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-4 rounded-full gap-2 transition-colors hover:bg-white/10"
                                                style={{ color: "var(--vault-gold)" }}
                                            >
                                                <ScanFace size={16} />
                                                <span className="font-mono text-[10px] uppercase tracking-widest">AR</span>
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogTrigger>

                    {/* Zoom Content */}
                    <DialogContent showCloseButton={false} className="max-w-[95vw] w-full h-[95vh] bg-black/95 border-none p-0 overflow-hidden flex flex-col items-center justify-center outline-none">
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
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 3D Viewer Dialog */}
                <Dialog open={is3DOpen} onOpenChange={setIs3DOpen}>
                    <DialogContent showCloseButton={false} className="max-w-4xl w-[90vw] h-[80vh] border p-0 overflow-hidden" style={{ background: "var(--vault-bg)", borderColor: "var(--vault-border)" }}>
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
                                className="absolute top-4 right-4 z-50 rounded-full hover:bg-white/10"
                                style={{ color: "var(--vault-fg)" }}
                                onClick={() => setIs3DOpen(false)}
                            >
                                <X size={24} />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Thumbnail Strip (Bottom) */}
            {validImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 justify-center">
                    {validImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                "relative w-16 h-16 flex-shrink-0 overflow-hidden border transition-all",
                                selectedIndex === idx
                                    ? "opacity-100 shadow-md"
                                    : "opacity-40 hover:opacity-100"
                            )}
                            style={{
                                borderColor: selectedIndex === idx ? "var(--vault-gold)" : "var(--vault-border)",
                                borderRadius: "2px"
                            }}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

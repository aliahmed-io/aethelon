"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Box, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Vector3 } from "three";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Dynamically import the heavy 3D component with no SSR
const ThreeDModel = dynamic(() => import("./ThreeDModel"), {
    ssr: false,
    loading: () => null,
});

interface ThreeDViewerProps {
    modelUrl: string | null;
    images: string[];
    altTitle?: string;
}

export function ThreeDViewer({ modelUrl, images, altTitle = "Product Image" }: ThreeDViewerProps) {
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasError, setHasError] = useState(false); // Restore state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [orbitTarget, setOrbitTarget] = useState<Vector3 | null>(null);
    const [orbitRadius, setOrbitRadius] = useState<number | null>(null);

    const handleModelBounds = useCallback((center: Vector3, radius: number) => {
        setOrbitTarget(center);
        setOrbitRadius(radius);
    }, []);

    const handleInteraction = () => {
        if (!modelUrl) return;
        setIsInteracting(true);
        setHasError(false); // Reset error on new interaction
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-transparent">

                {/* 2D Image View */}
                <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {images[currentImageIndex] && (
                        <Image
                            src={images[currentImageIndex]}
                            alt={altTitle}
                            fill
                            className="object-cover bg-gray-100 dark:bg-gray-900"
                            priority
                        />
                    )}

                    {/* Navigation Arrows for 2D */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-sm transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-sm transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* 3D Model Viewer Layer */}
                <AnimatePresence>
                    {isInteracting && modelUrl && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full z-10 bg-white dark:bg-gray-900"
                        >
                            <ErrorBoundary
                                onError={() => setHasError(true)}
                                fallback={
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                                            <p className="text-red-500 font-medium mb-2">Failed to load 3D model</p>
                                            <Button variant="outline" size="sm" onClick={() => { setIsInteracting(false); setHasError(false); }}>Close</Button>
                                        </div>
                                    </div>
                                }
                            >
                                <ThreeDModel
                                    modelUrl={modelUrl}
                                    onBounds={handleModelBounds}
                                    orbitTarget={orbitTarget}
                                    orbitRadius={orbitRadius}
                                />
                            </ErrorBoundary>

                            {/* Close 3D Button - Only show if no error */}
                            {!hasError && (
                                <button
                                    onClick={() => setIsInteracting(false)}
                                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-colors"
                                    title="Close 3D View"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* "View in 3D" Pill Button */}
                {!isInteracting && modelUrl && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                        <Button
                            onClick={handleInteraction}
                            variant="secondary"
                            className="bg-white/90 dark:bg-black/80 text-black dark:text-white hover:scale-105 active:scale-95 shadow-sm rounded-full px-5 py-2 h-auto text-xs font-medium border border-gray-200 dark:border-gray-700 backdrop-blur-md transition-all gap-2"
                        >
                            <Box className="w-3.5 h-3.5" />
                            View in 3D
                        </Button>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                setIsInteracting(false);
                                setCurrentImageIndex(idx);
                            }}
                            className={`relative w-16 h-16 rounded-md overflow-hidden border transition-colors bg-white dark:bg-gray-950 shadow-sm ${currentImageIndex === idx && !isInteracting
                                ? "border-gray-900 dark:border-gray-100"
                                : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${altTitle} - View ${idx + 1}`}
                                fill
                                className="object-cover bg-gray-100 dark:bg-gray-900"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

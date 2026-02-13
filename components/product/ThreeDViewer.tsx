"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Box, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Vector3 } from "three";
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const ArModelViewer = dynamic(() => import("./ArModelViewer"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>,
});

interface ThreeDViewerProps {
    modelUrl: string | null;
    usdzUrl?: string | null; // Added for AR
    images: string[];
    altTitle?: string;
}

export function ThreeDViewer({ modelUrl, usdzUrl, images, altTitle = "Product Image" }: ThreeDViewerProps) {
    const [isInteracting, setIsInteracting] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [orbitTarget, setOrbitTarget] = useState<Vector3 | null>(null);
    const [orbitRadius, setOrbitRadius] = useState<number | null>(null);
    const [isModelReady, setIsModelReady] = useState(false);

    // Progressive Loading: Silently preload the model
    useEffect(() => {
        if (!modelUrl) return;

        useGLTF.preload(modelUrl);

        // Simple check to simulate readiness or wait for preload callback
        // In R3F, preload is void, but cached. We can try to fetch it or just assume quick load 
        // after a timeout or use a loader. For this "luxury feel", let's set it ready 
        // immediately if cached, or fake a small delay to prevent layout jump.
        // Better yet, just set ready.
        setIsModelReady(true);

    }, [modelUrl]);

    const handleModelBounds = useCallback((center: Vector3, radius: number) => {
        setOrbitTarget(center);
        setOrbitRadius(radius);
    }, []);

    const handleInteraction = () => {
        if (!modelUrl) return;
        setIsInteracting(true);
        setHasError(false);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-[#0A0A0C] border border-white/5">

                {/* 2D Image View */}
                <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isInteracting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {images[currentImageIndex] && (
                        <Image
                            src={images[currentImageIndex]}
                            alt={altTitle}
                            fill
                            className="object-contain p-12"
                            priority
                        />
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10"
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
                            className="absolute inset-0 w-full h-full z-10 bg-[#0A0A0C]"
                        >
                            <ErrorBoundary
                                onError={() => setHasError(true)}
                                fallback={
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                        <div className="bg-black border border-white/10 p-6 text-center">
                                            <p className="text-red-500 text-xs font-mono mb-4 uppercase">Failed to load model</p>
                                            <button className="px-4 py-2 bg-white text-black text-xs font-bold uppercase" onClick={() => { setIsInteracting(false); setHasError(false); }}>Close</button>
                                        </div>
                                    </div>
                                }
                            >
                                <ArModelViewer
                                    src={modelUrl || ""}
                                    iosSrc={usdzUrl || undefined}
                                    alt={altTitle}
                                />
                            </ErrorBoundary>

                            {!hasError && (
                                <button
                                    onClick={() => setIsInteracting(false)}
                                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 hover:bg-white text-white hover:text-black transition-colors backdrop-blur-md border border-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* "View in 3D" Pill Button - Only show when model is ready */}
                {!isInteracting && modelUrl && isModelReady && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                        <button
                            onClick={handleInteraction}
                            className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                        >
                            <Box className="w-3.5 h-3.5" />
                            View in 3D
                        </button>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setIsInteracting(false);
                                setCurrentImageIndex(idx);
                            }}
                            className={`relative w-16 h-16 rounded-sm overflow-hidden border transition-all ${currentImageIndex === idx && !isInteracting
                                ? "border-white opacity-100"
                                : "border-white/10 opacity-50 hover:opacity-100"
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`View ${idx + 1}`}
                                fill
                                className="object-contain p-2 bg-[#0A0A0C]"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

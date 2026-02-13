"use client";

import { useState, useRef } from "react";
import { Camera, Sparkles, RefreshCw, Check } from "lucide-react";
import Image from "next/image";
import { generateTryOn } from "./actions";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function TryOnForm() {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setResultUrl(null);
        }
    };

    const handleGenerate = async () => {
        if (!fileInputRef.current?.files?.[0]) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append("image", fileInputRef.current.files[0]);

        const result = await generateTryOn(formData);

        if (!result.success) {
            toast.error(result.message || "Fitting failed.");
            setIsProcessing(false);
            return;
        }

        if (result.imageUrl) {
            setResultUrl(result.imageUrl);
            if (result.remainingGenerations !== undefined) {
                toast.success(`Fitting Complete. ${result.remainingGenerations} tries remaining today.`);
            }
        }
        setIsProcessing(false);
    };

    const reset = () => {
        setPreviewUrl(null);
        setResultUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full relative group">
            <AnimatePresence mode="wait">
                {!previewUrl ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-[500px] bg-muted/50 flex flex-col items-center justify-center border border-dashed border-border rounded-sm relative overflow-hidden cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center z-10">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/10 transition-colors border border-border">
                                <Camera className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                            </div>
                            <h3 className="text-lg font-light tracking-wide mb-2 text-foreground">Initialize Scanner</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 font-light">
                                Upload a room reference for Imagen 3 calibration.
                            </p>

                            <button className="px-8 py-3 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-colors rounded-sm">
                                Select Reference
                            </button>
                        </div>

                        {/* Scanning Grid Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(201,145,43,0.05)_50%,rgba(0,0,0,0)_55%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-[500px] bg-muted/50 relative rounded-sm overflow-hidden border border-border"
                    >
                        {/* Image Display */}
                        <div className="absolute inset-0">
                            <Image
                                src={resultUrl || previewUrl}
                                alt="Try On"
                                fill
                                className={clsx("object-cover transition-all duration-1000", isProcessing ? "scale-105 blur-sm" : "scale-100 blur-0")}
                            />

                            {/* Scanning overlay during processing */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-foreground/40 z-10 flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-2 border-foreground/20 border-t-accent animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="mt-6 text-xs uppercase tracking-widest text-white font-light animate-pulse">
                                        Synthesizing with Imagen 3...
                                    </p>
                                </div>
                            )}

                            {/* Result Overlay */}
                            {resultUrl && !isProcessing && (
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-foreground/70 to-transparent flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium text-lg">Fitting Complete</p>
                                        <p className="text-white/70 text-xs uppercase tracking-wide">Aethelon Signature Lounge Chair</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={reset} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                        <button className="px-6 py-3 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-colors rounded-sm flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Add to Bag
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons (Before Generation) */}
                        {!resultUrl && !isProcessing && (
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
                                <button
                                    onClick={handleGenerate}
                                    className="px-10 py-4 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-[0_0_40px_rgba(201,145,43,0.3)] hover:shadow-[0_0_60px_rgba(201,145,43,0.5)] active:scale-95 rounded-sm flex items-center gap-3"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generate Fitting
                                </button>
                                <button
                                    onClick={reset}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 p-3 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}

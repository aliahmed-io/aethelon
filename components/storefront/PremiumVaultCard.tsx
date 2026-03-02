"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Cuboid } from "lucide-react";
import { useState, useEffect } from "react";

interface PremiumVaultCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
        modelUrl?: string | null;
    };
    href: string;
    isSelected?: boolean;
}

export function PremiumVaultCard({ product, href, isSelected }: PremiumVaultCardProps) {
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        if (!product.images || product.images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIdx(prev => (prev + 1) % product.images.length);
        }, 1500);

        return () => clearInterval(interval);
    }, [product.images]);

    return (
        <Link
            href={href}
            className={`group relative w-full block text-left overflow-hidden rounded-md transition-all duration-700 ${isSelected
                ? "ring-1 ring-amber-500/50 bg-black"
                : "hover:bg-zinc-950 bg-background"
                }`}
        >
            <div className="aspect-[4/5] w-full overflow-hidden relative bg-zinc-900 border border-white/5">
                {product.images.map((img, idx) => {
                    const isActive = idx === currentImageIdx;
                    return (
                        <Image
                            key={idx}
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            fill
                            className={`object-cover transition-all duration-1000 ease-in-out ${isSelected
                                    ? (isActive ? "scale-105 opacity-80" : "scale-105 opacity-0")
                                    : (isActive ? "group-hover:scale-110 opacity-60 group-hover:opacity-100" : "scale-100 opacity-0")
                                }`}
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    );
                })}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-4 right-4">
                    <Sparkles className={`w-4 h-4 transition-colors duration-500 ${isSelected ? "text-amber-500" : "text-white/20 group-hover:text-white/60"}`} />
                </div>

                {/* Vault 3D Badge */}
                {product.modelUrl && (
                    <div
                        className="absolute bottom-[90px] left-4 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.2em] flex items-center gap-1.5 backdrop-blur-md pointer-events-none"
                        style={{
                            color: "var(--vault-gold, #AB7E22)",
                            border: "1px solid rgba(171,126,34,0.3)",
                            background: "rgba(28,21,16,0.8)"
                        }}
                    >
                        <Cuboid className="w-3 h-3" strokeWidth={1.5} />
                        <span>3D</span>
                    </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-5 w-full">
                    <h3 className={`font-display text-lg tracking-wide uppercase transition-colors duration-500 ${isSelected ? "text-amber-400" : "text-white/90"}`}>
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between mt-3">
                        <p className="text-white/50 text-[10px] font-mono tracking-widest uppercase border border-white/20 px-1 py-0.5" style={{ color: "var(--vault-gold)" }}>
                            LIMITED
                        </p>
                        <div className={`flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-all duration-500 ${isSelected ? "text-amber-500 translate-x-0 opacity-100" : "text-white/40 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}>
                            <span>Preview</span>
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

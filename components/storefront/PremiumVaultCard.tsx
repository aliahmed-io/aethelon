"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

interface PremiumVaultCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
    };
    href: string;
    isSelected?: boolean;
}

export function PremiumVaultCard({ product, href, isSelected }: PremiumVaultCardProps) {
    return (
        <Link
            href={href}
            className={`group relative w-full block text-left overflow-hidden rounded-md transition-all duration-700 ${isSelected
                ? "ring-1 ring-amber-500/50 bg-black"
                : "hover:bg-zinc-950 bg-background"
                }`}
        >
            <div className="aspect-[4/5] w-full overflow-hidden relative bg-zinc-900 border border-white/5">
                <Image
                    src={product.images[0] || ""}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-1000 ease-out ${isSelected ? "scale-105 opacity-80" : "group-hover:scale-110 opacity-60 group-hover:opacity-100"
                        }`}
                    sizes="(max-width: 768px) 100vw, 300px"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-4 right-4">
                    <Sparkles className={`w-4 h-4 transition-colors duration-500 ${isSelected ? "text-amber-500" : "text-white/20 group-hover:text-white/60"}`} />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-5 w-full">
                    <h3 className={`font-display text-lg tracking-wide uppercase transition-colors duration-500 ${isSelected ? "text-amber-400" : "text-white/90"}`}>
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between mt-3">
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            Unique Piece
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

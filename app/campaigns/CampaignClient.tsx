"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/app/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";

interface Banner {
    id: string;
    title: string;
    imageString: string;
    link: string | null;
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string[];
}

interface CampaignClientProps {
    heroBanner: Banner | null;
    featuredProducts: Product[];
}

export function CampaignClient({ heroBanner, featuredProducts }: CampaignClientProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="bg-[#050505] text-white min-h-screen" ref={containerRef}>
            <Navbar />

            {/* HERO BANNER SECTION */}
            <section className="relative h-screen w-full overflow-hidden">
                {heroBanner ? (
                    <>
                        <Image
                            src={heroBanner.imageString}
                            alt={heroBanner.title}
                            fill
                            className="object-cover scale-110"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                        <div className="absolute inset-0 flex items-end pb-24 px-8 md:px-16">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="max-w-2xl"
                            >
                                <span className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-4 block">Current Campaign</span>
                                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
                                    {heroBanner.title}
                                </h1>
                                {heroBanner.link && (
                                    <Link
                                        href={heroBanner.link}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors"
                                    >
                                        Explore Collection <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </motion.div>
                        </div>

                        {/* Scroll indicator */}
                        <motion.div
                            className="absolute bottom-8 left-1/2 -translate-x-1/2"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <ArrowDown className="w-6 h-6 text-white/50" />
                        </motion.div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white/20">No Active Campaign</h1>
                            <p className="text-white/40">Add a banner in the Admin Dashboard</p>
                        </div>
                    </div>
                )}
            </section>

            {/* FEATURED PRODUCTS - STACKING SCROLL */}
            {featuredProducts.length > 0 && (
                <section className="relative">
                    <div className="py-20 px-8 text-center border-b border-white/5">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl md:text-5xl font-black uppercase tracking-tighter"
                        >
                            Featured Timepieces
                        </motion.h2>
                        <p className="text-white/40 mt-4 max-w-md mx-auto">Scroll to discover our curated selection</p>
                    </div>

                    {/* Stacking Cards Container */}
                    <div className="relative">
                        {featuredProducts.map((product, index) => (
                            <StackingCard
                                key={product.id}
                                product={product}
                                index={index}
                                total={featuredProducts.length}
                                isMounted={isMounted}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* FOOTER */}
            <footer className="min-h-[40vh] flex items-center justify-center border-t border-white/5">
                <div className="text-center">
                    <p className="text-white/30 text-sm uppercase tracking-widest mb-4">Velorum Geneve</p>
                    <Link href="/shop" className="text-amber-400 hover:text-amber-300 text-sm uppercase tracking-widest flex items-center gap-2 justify-center">
                        View All Timepieces <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </footer>
        </div>
    );
}

// ============================================================
// STACKING CARD COMPONENT
// ============================================================

function StackingCard({
    product,
    index,
    total,
    isMounted,
}: {
    product: Product;
    index: number;
    total: number;
    isMounted: boolean;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"],
    });

    // Each card sticks at a slightly different position
    const stickyTop = 100 + index * 40;
    const zIndex = total - index;

    // Parallax for the image
    const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);

    return (
        <div
            ref={cardRef}
            className="h-[120vh] relative"
            style={{ zIndex }}
        >
            <motion.div
                className="sticky w-full min-h-[80vh] mx-auto px-4 md:px-8"
                style={{
                    top: stickyTop,
                    opacity: isMounted ? opacity : 1,
                    scale: isMounted ? scale : 1,
                }}
            >
                <Link href={`/product/${product.id}`}>
                    <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-sm overflow-hidden shadow-2xl shadow-black/50 h-[70vh] md:h-[75vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                            {/* Image Side */}
                            <div className="relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-0"
                                    style={{ y: isMounted ? imageY : 0 }}
                                >
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-900/20 to-transparent flex items-center justify-center">
                                            <span className="text-white/20 text-6xl font-black">0{index + 1}</span>
                                        </div>
                                    )}
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/80 md:block hidden" />
                            </div>

                            {/* Content Side */}
                            <div className="relative flex flex-col justify-center p-8 md:p-16">
                                <span className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-4">
                                    Featured 0{index + 1}
                                </span>
                                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                    {product.name}
                                </h3>
                                <p className="text-white/50 mb-8 line-clamp-3 max-w-md">
                                    {product.description || "Discover the essence of luxury timekeeping."}
                                </p>
                                <div className="flex items-end gap-8">
                                    <div>
                                        <span className="text-xs text-white/40 uppercase tracking-widest block mb-1">Price</span>
                                        <span className="text-3xl font-light">${product.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Decorative number */}
                                <span className="absolute bottom-8 right-8 text-[12rem] font-black text-white/[0.03] leading-none select-none hidden md:block">
                                    0{index + 1}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        </div>
    );
}

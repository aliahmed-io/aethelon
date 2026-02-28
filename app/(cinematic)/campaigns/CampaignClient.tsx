"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown, Cuboid } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string[];
    modelUrl?: string | null;
}

interface Campaign {
    id: string;
    title: string;
    description: string | null;
    heroImage: string | null;
    theme: any;
}

interface CampaignClientProps {
    campaign: Campaign;
    products: Product[];
    footer?: React.ReactNode;
}

export function CampaignClient({ campaign, products, footer }: CampaignClientProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

    // Update active index based on scroll
    useEffect(() => {
        return scrollYProgress.onChange((latest) => {
            const index = Math.min(
                products.length - 1,
                Math.floor(latest * products.length)
            );
            setActiveIndex(index);
        });
    }, [products.length, scrollYProgress]);

    return (
        <div
            className="vault bg-[#131009] text-[#EDE0CC] relative"
            style={{
                backgroundColor: campaign.theme?.backgroundColor || "#131009"
            }}
        >
            <Navbar />

            {/* HERO BANNER - CINEMATIC ENTRY */}
            <section className="relative h-[100svh] w-full overflow-hidden flex items-center justify-center">
                {campaign.heroImage && (
                    <>
                        <Image
                            src={campaign.heroImage}
                            alt={campaign.title}
                            fill
                            className="object-cover opacity-40 scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#131009] via-transparent to-[#131009]" />
                    </>
                )}

                <div className="relative z-10 text-center px-6 max-w-4xl">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-[10px] font-mono tracking-[0.5em] uppercase text-[#AB7E22] block mb-6"
                    >
                        Private Archive Session
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-5xl md:text-9xl font-serif uppercase tracking-tighter leading-none mb-8"
                    >
                        {campaign.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-[#9A7A5C] text-sm md:text-xl uppercase tracking-[0.3em] font-light max-w-2xl mx-auto leading-relaxed"
                    >
                        {campaign.description || "A curated journey through horological excellence and aesthetic rarity."}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mt-12 flex flex-col items-center gap-4"
                    >
                        <ArrowDown className="w-5 h-5 text-[#AB7E22] animate-bounce" />
                        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#57412A]">
                            Scroll to Reveal
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* LOOM TRACK CONTAINER */}
            <div className="relative min-h-[400vh]" ref={containerRef}>
                <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col">

                    {/* BACKGROUND LAYER - LOOMING DEPTH */}
                    <motion.div
                        className="absolute inset-0 opacity-10 blur-3xl pointer-events-none"
                        style={{ x: bgX }}
                    >
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#AB7E22] rounded-full" />
                        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#2A1E14] rounded-full" />
                    </motion.div>

                    {/* HEADER / INTRO */}
                    <header className="pt-24 px-8 md:px-16 flex justify-between items-end relative z-10 h-32 flex-shrink-0">
                        <div>
                            <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-[#AB7E22] block mb-2">
                                Curated Pieces
                            </span>
                            <h2 className="text-2xl md:text-4xl font-serif uppercase tracking-tight leading-none text-[#EDE0CC]/60">
                                {campaign.title}
                            </h2>
                        </div>
                        <div className="text-right hidden md:block">
                            <span className="text-[4rem] font-serif italic text-[#AB7E22]/10 leading-none select-none">
                                0{products.length}
                            </span>
                        </div>
                    </header>

                    {/* HORIZONTAL LOOM TRACK */}
                    <div className="flex-1 relative flex items-center justify-center">
                        {products.map((product, idx) => (
                            <LoomCard
                                key={product.id}
                                product={product}
                                index={idx}
                                total={products.length}
                                scrollYProgress={scrollYProgress}
                                isActive={idx === activeIndex}
                                activeIndex={activeIndex}
                            />
                        ))}
                    </div>

                    {/* NAVIGATION / FOOTER SCROLL INDICATOR */}
                    <footer className="h-24 px-8 md:px-16 flex items-center justify-between relative z-10 border-t border-[#2A1E14]/30">
                        <div className="flex gap-1">
                            {products.map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[2px] w-8 transition-colors duration-500"
                                    style={{
                                        backgroundColor: i <= activeIndex ? "#AB7E22" : "#2A1E14"
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono tracking-widest text-[#9A7A5C] uppercase">
                                Archive Piece 0{activeIndex + 1}
                            </span>
                            <div className="w-12 h-[1px] bg-[#AB7E22] mt-2 animate-pulse" />
                        </div>
                    </footer>
                </div>
            </div>

            {/* GLOBAL FOOTER */}
            <div className="relative z-20 bg-[#131009] border-t border-[#2A1E14]">
                {footer}
            </div>
        </div>
    );
}

function LoomCard({ product, index, total, scrollYProgress, isActive, activeIndex }: {
    product: Product;
    index: number;
    total: number;
    scrollYProgress: any;
    isActive: boolean;
    activeIndex: number;
}) {
    const start = index / total;
    const end = (index + 1) / total;
    const mid = (start + end) / 2;

    // Tighter dead-zone constraints. We need cards to fully leave
    // before the next one enters to avoid overlapping on mobile.
    const pad = Math.min(0.01, 0.5 / total);
    const safeStart = start + pad;
    const safeEnd = end - pad;
    const safeMid = (safeStart + safeEnd) / 2;

    // Sharper x transition: exit quickly over 5% of scroll (0.05) instead of 12%
    const x = useTransform(scrollYProgress,
        [safeStart - 0.05, safeStart, safeMid, safeEnd, safeEnd + 0.05],
        ["100%", "0%", "0%", "0%", "-100%"]
    );

    const scale = useTransform(scrollYProgress,
        [safeStart, safeMid, safeEnd],
        [0.85, 1, 0.95]
    );

    // Sharper opacity transition: fade quickly over 5% of scroll
    const opacity = useTransform(scrollYProgress,
        [safeStart - 0.05, safeStart, safeEnd, safeEnd + 0.05],
        [0, 1, 1, 0]
    );

    // We ensure the active card is always fully on top.
    // When leaving, it immediately drops strictly below the incoming card.
    const zIndex = isActive ? 30 : 0;

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center p-4 md:p-12 overflow-hidden"
            style={{
                x,
                scale,
                opacity,
                zIndex,
                pointerEvents: isActive ? "auto" : "none"
            }}
        >
            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center pointer-events-auto">
                {/* IMAGE LAYER */}
                {/* Made smaller on mobile: height 40vh instead of aspect-[4/5] to leave room for text below */}
                <div className="relative h-[40vh] md:h-auto md:aspect-square overflow-hidden border border-[#2A1E14] bg-[#1C1510] group rounded-sm shadow-xl mt-8 md:mt-0">
                    {product.images[0] && (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#131009] to-transparent" />

                    {/* Campaign 3D Badge */}
                    {product.modelUrl && (
                        <div className="absolute top-4 left-4 bg-black/40 border border-white/10 text-[#EDE0CC] backdrop-blur-xl px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] flex items-center gap-1.5 rounded-full shadow-sm">
                            <Cuboid className="w-3 h-3" strokeWidth={1.5} />
                            <span>3D Experience</span>
                        </div>
                    )}

                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 font-serif italic text-4xl md:text-6xl text-[#AB7E22]/30">
                        {index + 1}
                    </div>
                </div>

                {/* CONTENT LAYER */}
                {/* Centered on mobile with smaller text */}
                <div className="flex flex-col gap-4 md:gap-10 text-center md:text-left items-center md:items-start px-2">
                    <div className="space-y-2 md:space-y-4">
                        <span className="text-[9px] md:text-[10px] font-mono tracking-[0.4em] uppercase text-[#AB7E22]">
                            Featured Piece
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif uppercase tracking-tight leading-[0.9] text-balance">
                            {product.name}
                        </h2>
                    </div>

                    <p className="text-[#9A7A5C] text-xs sm:text-sm md:text-lg leading-relaxed font-light max-w-sm md:max-w-md uppercase tracking-wide">
                        {product.description || "An exceptional example of horological mastery, curated from our private collections for this limited session."}
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mt-2 md:mt-0">
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-[9px] md:text-[10px] font-mono uppercase text-[#57412A] tracking-widest mb-1">Valuation</span>
                            <span className="text-2xl md:text-3xl font-serif text-[#EDE0CC]">
                                ${product.price.toLocaleString()}
                            </span>
                        </div>

                        <Link
                            href={`/shop/${product.id}`}
                            className="h-12 md:h-14 px-6 md:px-8 border border-[#AB7E22] text-[#AB7E22] uppercase font-mono text-[9px] md:text-[10px] tracking-[0.3em] flex items-center justify-center transition-all duration-300 hover:bg-[#AB7E22] hover:text-[#131009] group w-full md:w-auto"
                        >
                            View Details
                            <ArrowRight className="w-3 h-3 ml-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            <h3 className="absolute bottom-[-2%] left-[-5%] text-[15vw] md:text-[15vw] font-serif italic text-[#2A1E14]/10 pointer-events-none select-none -z-10 uppercase whitespace-nowrap overflow-hidden max-w-[110vw]">
                {product.name}
            </h3>
        </motion.div>
    );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string[];
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

    // Dead-zone padding prevents two cards from both appearing "active" at the same time,
    // which is a common cause of jitter/overlap on mobile browsers.
    const pad = Math.min(0.03, 0.5 / total);
    const safeStart = start + pad;
    const safeEnd = end - pad;
    const safeMid = (safeStart + safeEnd) / 2;

    const x = useTransform(scrollYProgress,
        [safeStart - 0.12, safeStart, safeMid, safeEnd, safeEnd + 0.12],
        ["100%", "0%", "0%", "0%", "-100%"]
    );

    const scale = useTransform(scrollYProgress,
        [safeStart, safeMid, safeEnd],
        [0.85, 1, 0.95]
    );

    const opacity = useTransform(scrollYProgress,
        [safeStart - 0.18, safeStart, safeEnd, safeEnd + 0.18],
        [0, 1, 1, 0]
    );

    const zIndex = isActive ? 30 : 10 - Math.min(9, Math.abs(index - activeIndex));

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
            style={{
                x,
                scale,
                opacity,
                zIndex,
                pointerEvents: isActive ? "auto" : "none"
            }}
        >
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center pointer-events-auto">
                {/* IMAGE LAYER */}
                <div className="relative aspect-[4/5] md:aspect-square overflow-hidden border border-[#2A1E14] bg-[#1C1510] group">
                    {product.images[0] && (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#131009] to-transparent" />

                    <div className="absolute bottom-6 right-6 font-serif italic text-6xl text-[#AB7E22]/20">
                        {index + 1}
                    </div>
                </div>

                {/* CONTENT LAYER */}
                <div className="flex flex-col gap-6 md:gap-10">
                    <div className="space-y-4">
                        <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#AB7E22]">
                            Featured Piece
                        </span>
                        <h2 className="text-4xl md:text-7xl font-serif uppercase tracking-tight leading-[0.9]">
                            {product.name}
                        </h2>
                    </div>

                    <p className="text-[#9A7A5C] text-sm md:text-lg leading-relaxed font-light max-w-md uppercase tracking-wide">
                        {product.description || "An exceptional example of horological mastery, curated from our private collections for this limited session."}
                    </p>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono uppercase text-[#57412A] tracking-widest mb-1">Valuation</span>
                            <span className="text-2xl md:text-3xl font-serif text-[#EDE0CC]">
                                ${product.price.toLocaleString()}
                            </span>
                        </div>

                        <Link
                            href={`/shop/${product.id}`}
                            className="h-14 px-8 border border-[#AB7E22] text-[#AB7E22] uppercase font-mono text-[10px] tracking-[0.3em] flex items-center justify-center transition-all duration-300 hover:bg-[#AB7E22] hover:text-[#131009] group"
                        >
                            View Details
                            <ArrowRight className="w-3 h-3 ml-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            <h3 className="absolute bottom-[-5%] left-[-5%] text-[15vw] font-serif italic text-[#2A1E14]/10 pointer-events-none select-none -z-10 uppercase whitespace-nowrap">
                {product.name}
            </h3>
        </motion.div>
    );
}

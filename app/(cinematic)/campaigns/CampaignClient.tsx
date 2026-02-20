"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { FurnitureFilterBar } from "@/components/shop/FurnitureFilterBar";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "newest";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Apply client-side sorting based on search param
    const sortedProducts = [...featuredProducts].sort((a, b) => {
        switch (currentSort) {
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "name-asc":
                return a.name.localeCompare(b.name);
            case "name-desc":
                return b.name.localeCompare(a.name);
            default:
                // Keep original featured order (newest/relevance)
                return 0;
        }
    });

    return (
        <div className="bg-background text-foreground min-h-screen" ref={containerRef}>
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
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-foreground/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-foreground/30 via-transparent to-transparent" />

                        <div className="absolute inset-0 flex items-end pb-24 px-8 md:px-16">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="max-w-2xl"
                            >
                                <span className="text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Current Campaign</span>
                                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-white drop-shadow-lg">
                                    {heroBanner.title}
                                </h1>
                                {heroBanner.link && (
                                    <Link
                                        href={heroBanner.link}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground text-sm font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors rounded-sm"
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
                            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-muted-foreground/30">No Active Campaign</h1>
                            <p className="text-muted-foreground">Add a banner in the Admin Dashboard</p>
                        </div>
                    </div>
                )}
            </section>

            {/* FEATURED PRODUCTS - GRID & FILTERS */}
            {featuredProducts.length > 0 && (
                <section className="relative container mx-auto px-6 py-20 pb-32">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl md:text-5xl font-black uppercase tracking-tighter"
                        >
                            Featured Collection
                        </motion.h2>
                        <p className="text-muted-foreground mt-4 max-w-md mx-auto">Discover the curated pieces for this campaign</p>
                    </div>

                    <FurnitureFilterBar
                        totalCount={sortedProducts.length}
                        categories={[]}
                        sizes={[]}
                    />

                    <ProductGrid products={sortedProducts} />
                </section>
            )}

            {/* FOOTER */}
            <footer className="min-h-[40vh] flex items-center justify-center border-t border-border">
                <div className="text-center">
                    <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">Aethelon Geneve</p>
                    <Link href="/shop" className="text-accent hover:text-accent/80 text-sm uppercase tracking-widest flex items-center gap-2 justify-center">
                        View All Timepieces <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </footer>
        </div>
    );
}

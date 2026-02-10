'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NarrativeSections() {
    return (
        <div className="relative z-10 pointer-events-none"> {/* Allow clicks to pass through to canvas if needed, but text needs pointer-events-auto */}
            {/* Section 1: Hero */}
            <section className="h-screen flex items-center justify-center text-center px-4 pointer-events-auto">
                <div className="max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight mb-6 text-primary">
                            AETHELON
                        </h1>
                        <p className="font-sans text-xl md:text-2xl text-muted-foreground mb-8 tracking-wide">
                            Furniture for the Soul
                        </p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="flex justify-center"
                        >
                            <div className="w-px h-24 bg-gradient-to-b from-accent to-transparent" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Section 2: Story */}
            <section className="min-h-screen flex items-center justify-center py-20 bg-background/50 backdrop-blur-sm pointer-events-auto">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-accent font-display text-xl tracking-widest"
                        >
                            OUR ORIGIN
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="font-display text-5xl md:text-6xl text-primary leading-tight"
                        >
                            Crafted from <br /> <span className="italic">History.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-muted-foreground leading-relaxed max-w-md"
                        >
                            Born in the workshops of Milan, designed for the modern sanctuary.
                            Aethelon blends centuries of craftsmanship with futuristic vision.
                        </motion.p>
                        <Link href="/about" className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors group">
                            Read our story <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        {/* Placeholder for Story Image - Particle effects handle visual interest here */}
                    </div>
                </div>
            </section>

            {/* Section 3: Collections Preview */}
            <section className="min-h-screen py-24 pointer-events-auto">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl mb-4">Curated Collections</h2>
                        <p className="text-muted-foreground">Timeless pieces for every room.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Living', link: '/shop/living' },
                            { title: 'Dining', link: '/shop/dining' },
                            { title: 'Bedroom', link: '/shop/bedroom' },
                        ].map((collection, idx) => (
                            <motion.div
                                key={collection.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <h3 className="font-display text-3xl text-primary tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        {collection.title}
                                    </h3>
                                </div>
                                <div className="absolute bottom-8 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                                    <Link href={collection.link} className="text-primary text-sm tracking-widest border-b border-primary pb-1">
                                        EXPLORE
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 4: AI Teaser */}
            <section className="h-[80vh] flex items-center justify-center bg-primary text-primary-foreground relative overflow-hidden pointer-events-auto">
                <div className="container mx-auto px-6 text-center z-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-4 py-1 rounded-full border border-accent/50 text-accent text-sm mb-6">
                            AETHELON INTELLIGENCE
                        </span>
                        <h2 className="font-display text-5xl md:text-7xl mb-8">
                            Design with <br /> <span className="text-accent italic">Vision.</span>
                        </h2>
                        <p className="text-white/60 text-xl max-w-2xl mx-auto mb-10">
                            Experience the future of interior design. Visualize our collection in your space instantly with AI.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <Link
                                href="/ai-vision"
                                className="bg-accent text-accent-foreground px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform"
                            >
                                Try Room Visualizer
                            </Link>
                            <Link
                                href="/ai-search"
                                className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-colors"
                            >
                                Ask Aethelon AI
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

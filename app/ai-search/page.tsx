'use client';

import { useState } from 'react';
import { Search, Mic, Camera, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AISearchPage() {
    const [query, setQuery] = useState('');

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-6xl">

                {/* Search Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1 rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Aethelon Intelligence</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-6xl mb-6">
                            Design with context.
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Don&apos;t just search for &quot;sofa&quot;. Tell us about your room, your style, and your mood.
                        </p>
                    </motion.div>
                </div>

                {/* Search Input */}
                <div className="max-w-3xl mx-auto relative mb-24 z-20">
                    <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
                    <div className="relative bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 flex items-center gap-4">
                        <Search className="w-6 h-6 text-muted-foreground ml-2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask anything... e.g. 'Velvet sofa for a small apartment in Paris'"
                            className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground/60"
                        />
                        <div className="flex items-center gap-2 border-l border-muted pl-4">
                            <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                <Mic className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Suggested Prompts */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {[
                            "Mid-century modern dining set",
                            "Cozy reading corner ideas",
                            "Minimalist bedroom layout",
                            "Lighting for high ceilings"
                        ].map((prompt, i) => (
                            <motion.button
                                key={prompt}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="text-sm bg-white/40 hover:bg-white/80 border border-white/20 px-4 py-2 rounded-full transition-all"
                                onClick={() => setQuery(prompt)}
                            >
                                {prompt}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Results Grid (Mock) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Main Results */}
                    <div className="md:col-span-8 space-y-8">
                        <h3 className="font-display text-2xl mb-6 flex items-center gap-2">
                            Suggested Products
                            <span className="text-sm font-sans text-muted-foreground bg-muted px-2 py-1 rounded-full">4 matches</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Product Card 1 */}
                            <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                    {/* Placeholder content */}
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-display text-4xl">
                                        Image
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-display text-lg">Copenhagen Sectional</h4>
                                        <span className="text-accent font-medium">$4,850</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">Deep teal velvet, modular design appropriate for small spaces.</p>
                                    <button className="w-full py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg text-sm font-medium">
                                        View Details
                                    </button>
                                </div>
                            </div>

                            {/* Product Card 2 */}
                            <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                    {/* Placeholder content */}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-display text-lg">Oslo Lounge Chair</h4>
                                        <span className="text-accent font-medium">$1,250</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">Scanning your room... matches the walnut floor tones.</p>
                                    <button className="w-full py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg text-sm font-medium">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Sidebar */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white/50 backdrop-blur border border-white/40 rounded-xl p-6 shadow-sm sticky top-32">
                            <div className="flex items-center gap-2 mb-4 text-accent">
                                <Sparkles className="w-5 h-5" />
                                <h3 className="font-display text-xl">Design Insights</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Why these results?</h4>
                                    <p className="text-sm leading-relaxed">
                                        Based on your query regarding &quot;small apartments&quot;, we prioritized modular pieces with exposed legs to create a sense of visual space.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Color Palette</h4>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#2C3E50]" title="Deep Teal" />
                                        <div className="w-8 h-8 rounded-full bg-[#E6B0AA]" title="Dusty Rose" />
                                        <div className="w-8 h-8 rounded-full bg-[#D35400]" title="Burnt Orange" />
                                        <div className="w-8 h-8 rounded-full bg-[#F5CBA7]" title="Cream" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Refined jewel tones to add depth without clutter using 60-30-10 rule.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-dotted border-muted-foreground/30">
                                    <button className="flex items-center text-sm font-medium text-primary hover:text-accent transition-colors w-full justify-between group">
                                        Generate Moodboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

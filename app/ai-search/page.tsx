'use client';

import { useState, useRef } from 'react';
import { Search, Mic, Camera, ArrowRight, Sparkles, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { performAiSearch } from './actions';
import { Product } from '@/lib/assistantTypes';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function AISearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [insight, setInsight] = useState('');
    const [relatedPrompts, setRelatedPrompts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert("Image too large. Please select an image under 4MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSearch = async (overrideQuery?: string) => {
        const searchQuery = overrideQuery || query;
        if (!searchQuery.trim() && !selectedImage) return;

        setIsLoading(true);
        setHasSearched(true);
        setResults([]);
        setInsight('');
        setRelatedPrompts([]);

        try {
            const data = await performAiSearch(searchQuery, selectedImage || undefined);
            setResults(data.products);
            setInsight(data.insight);
            setRelatedPrompts(data.relatedPrompts);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-6">
            <Navbar />
            <div className="container mx-auto max-w-6xl">

                {/* Search Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1 rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Aethelon Intelligence</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl mb-4 font-light tracking-tight">
                            Design with context.
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
                            Don&apos;t just search for &quot;sofa&quot;. Tell us about your room, your style, and your mood.
                        </p>
                    </motion.div>
                </div>

                {/* Search Input Area */}
                <div className="max-w-3xl mx-auto relative mb-16 z-20">
                    <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
                    <div className="relative bg-white/50 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 flex flex-col gap-4">

                        {/* Image Preview */}
                        <AnimatePresence>
                            {selectedImage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative w-fit"
                                >
                                    <div className="h-20 w-20 relative rounded-lg overflow-hidden border border-border">
                                        <Image src={selectedImage} alt="Context" fill className="object-cover" />
                                        <button
                                            onClick={clearImage}
                                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Image Context Added</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-4">
                            <Search className="w-6 h-6 text-muted-foreground ml-2 flex-shrink-0" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything... e.g. 'Velvet sofa for a small apartment in Paris'"
                                className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground/60 w-full"
                            />
                            <div className="flex items-center gap-2 border-l border-muted pl-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-2 rounded-full transition-colors ${selectedImage ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:bg-black/5 hover:text-foreground'}`}
                                    title="Upload Image Context"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={isLoading || (!query && !selectedImage)}
                                    className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Suggested Prompts - Only show if no results/search yet */}
                    {!hasSearched && (
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
                                    onClick={() => {
                                        setQuery(prompt);
                                        handleSearch(prompt);
                                    }}
                                >
                                    {prompt}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Area - Loading or Results */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse" />
                            <Sparkles className="w-12 h-12 text-accent relative z-10 animate-bounce" />
                        </div>
                        <p className="text-muted-foreground text-lg animate-pulse font-light">Analyzing your request & styling context...</p>
                    </div>
                ) : hasSearched && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* Main Results */}
                        <div className="md:col-span-8 space-y-8">
                            <h3 className="font-display text-2xl mb-6 flex items-center gap-2">
                                Curated Selection
                                <span className="text-sm font-sans text-muted-foreground bg-muted px-2 py-1 rounded-full">{results.length} matches</span>
                            </h3>

                            {results.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {results.map((product) => (
                                        <div key={product.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                                            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                                {product.images && product.images[0] ? (
                                                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-display text-4xl">
                                                        Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-display text-lg line-clamp-1">{product.name}</h4>
                                                    <span className="text-accent font-medium whitespace-nowrap">{formatPrice(product.price)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{product.description}</p>
                                                <Link href={`/shop/${product.id}`} className="w-full py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg text-sm font-medium text-center block">
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted/30 rounded-xl border border-border border-dashed">
                                    <p className="text-muted-foreground">No perfect matches found directly. Try adjusting your query or image context.</p>
                                </div>
                            )}
                        </div>

                        {/* AI Insights Sidebar */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="bg-white/50 backdrop-blur border border-white/40 rounded-xl p-6 shadow-sm sticky top-32">
                                <div className="flex items-center gap-2 mb-4 text-accent">
                                    <Sparkles className="w-5 h-5" />
                                    <h3 className="font-display text-xl">Design Insights</h3>
                                </div>

                                <div className="space-y-6">
                                    {insight ? (
                                        <div>
                                            <div className="prose prose-sm text-muted-foreground leading-relaxed">
                                                {insight}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Insights will appear here after search.</p>
                                    )}

                                    {/* Color Palette Extraction (Mock for now, could get from Image Analysis debug) */}
                                    {selectedImage && (
                                        <div>
                                            <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Context Analysis</h4>
                                            <p className="text-xs text-muted-foreground">Image analyzed for style, color, and composition.</p>
                                        </div>
                                    )}

                                    {relatedPrompts.length > 0 && (
                                        <div className="pt-4 border-t border-dotted border-muted-foreground/30">
                                            <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Try asking...</h4>
                                            <div className="space-y-2">
                                                {relatedPrompts.map((prompt, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setQuery(prompt);
                                                            handleSearch(prompt);
                                                        }}
                                                        className="flex items-center text-sm font-medium text-primary hover:text-accent transition-colors w-full justify-between group text-left"
                                                    >
                                                        {prompt} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

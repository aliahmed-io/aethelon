"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ShoppingBag, ArrowRight } from "lucide-react"; // Removed Aperture
import { WatchLoupeIcon } from "../icons/WatchLoupeIcon";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearch } from "./SearchContext";
import { useDebounce } from "use-debounce";
import { Product } from "@/lib/assistantTypes";
import { formatPrice } from "@/lib/utils";
import clsx from "clsx";

interface SearchApiResponse {
    results: Product[];
    error?: string;
}

export function SearchOverlay() {
    const { isOpen, closeSearch } = useSearch();
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [debouncedQuery] = useDebounce(query, 300);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const [results, setResults] = React.useState<Product[]>([]);
    const [aiResults, setAiResults] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [aiLoading, setAiLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            const id = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => {
                clearTimeout(id);
                document.body.style.overflow = "";
            };
        }
    }, [isOpen]);

    React.useEffect(() => {
        async function fetchResults() {
            if (!debouncedQuery) {
                setResults([]);
                setAiResults([]);
                return;
            }

            // 1. Standard Search
            setLoading(true);
            setAiResults([]);
            try {
                const res = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: debouncedQuery, searchType: "standard" }),
                });
                const data: SearchApiResponse = await res.json();
                setResults(data.results || []);
            } catch (error) {
                console.error("Standard search failed", error);
            } finally {
                setLoading(false);
            }

            // 2. AI Search (Background Rerank)
            // Only run if we have a query
            if (debouncedQuery.length > 2) {
                setAiLoading(true);
                try {
                    const res = await fetch("/api/search", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query: debouncedQuery, searchType: "ai" }),
                    });
                    const data: SearchApiResponse = await res.json();
                    if (data.results && data.results.length > 0) {
                        setAiResults(data.results);
                    }
                } catch (error) {
                    console.error("AI search failed", error);
                } finally {
                    setAiLoading(false);
                }
            }
        }

        void fetchResults();
    }, [debouncedQuery]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSearch}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
                    />

                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-12 md:pt-24 pointer-events-none px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, ease: "circOut" }}
                            className="w-full max-w-3xl bg-[#0A0A0C]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl pointer-events-auto overflow-hidden ring-1 ring-white/10"
                        >
                            <div className="flex items-center border-b border-white/10 px-6 py-6 bg-white/5">
                                <Search className="mr-4 h-5 w-5 text-white/50" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search collection..."
                                    className="flex-1 bg-transparent text-xl outline-none placeholder:text-white/20 text-white font-light tracking-wide"
                                />
                                <button type="button" onClick={closeSearch} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-white/50" />
                                </button>
                            </div>

                            <div className="max-h-[65vh] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                                        <p className="text-white/30 text-xs uppercase tracking-widest animate-pulse">Searching Archives...</p>
                                    </div>
                                ) : results.length > 0 || aiResults.length > 0 ? (
                                    <div className="space-y-8">

                                        {/* AI Recommended Section */}
                                        {(aiLoading || aiResults.length > 0) && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 px-1">
                                                    <WatchLoupeIcon className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                                        {aiLoading ? "Consulting AI..." : "Concierge Recommendations"}
                                                    </h3>
                                                </div>

                                                {aiLoading ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                                                        <div className="h-24 bg-white/5 rounded-sm" />
                                                        <div className="h-24 bg-white/5 rounded-sm" />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {aiResults.map((product) => (
                                                            <ProductCard
                                                                key={`ai-${product.id}`}
                                                                product={product}
                                                                isAi={true}
                                                                onClick={() => { closeSearch(); router.push(`/shop/${product.id}`); }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="border-b border-white/5 my-4" />
                                            </div>
                                        )}

                                        {/* Standard Results */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">All Results</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {results.map((product) => (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        onClick={() => { closeSearch(); router.push(`/shop/${product.id}`); }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : query ? (
                                    <div className="py-16 text-center text-white/30">
                                        <ShoppingBag className="mx-auto h-10 w-10 text-white/10 mb-4" />
                                        <p className="text-lg font-light">No timepieces found.</p>
                                    </div>
                                ) : (
                                    <div className="py-16 text-center text-white/20">
                                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-white/5 mb-4">
                                            <WatchLoupeIcon className="h-6 w-6 text-white/40" />
                                        </div>
                                        <p className="text-sm font-light">Ask for &quot;Chronograph under $5000&quot; or search by name</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

function ProductCard({ product, isAi = false, onClick }: { product: Product; isAi?: boolean; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "flex items-center gap-4 p-3 rounded-md cursor-pointer transition-all group border",
                isAi
                    ? "bg-zinc-500/5 border-zinc-500/20 hover:bg-zinc-500/10"
                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
            )}
        >
            <div className="relative w-16 h-16 bg-white/5 rounded-sm overflow-hidden flex-shrink-0 border border-white/10">
                {product.images?.[0] && (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                )}
                {isAi && (
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={clsx("font-medium text-sm truncate transition-colors", isAi ? "text-zinc-200 group-hover:text-white" : "text-white/80 group-hover:text-white")}>
                        {product.name}
                    </h4>
                    {isAi && <WatchLoupeIcon className="w-3 h-3 text-emerald-400" />}
                </div>

                <p className="text-white/40 text-xs truncate font-light">{product.category}</p>
            </div>
            <div className="text-right pl-2">
                <p className="text-white font-medium text-sm tracking-wide">{formatPrice(product.price)}</p>
                <ArrowRight className="w-4 h-4 text-white/20 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
        </div>
    );
}

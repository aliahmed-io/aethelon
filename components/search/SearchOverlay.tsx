"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearch } from "./SearchContext";
import { useDebounce } from "use-debounce";
import { Product } from "@/lib/assistantTypes";
import { formatPrice } from "@/lib/utils";
import clsx from "clsx";
import { searchProductsAction } from "@/app/store/search-actions";



export function SearchOverlay() {
    const { isOpen, closeSearch } = useSearch();
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [debouncedQuery] = useDebounce(query, 300);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const [results, setResults] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(false);

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
                return;
            }

            setLoading(true);
            try {
                // Server Action Call (Next.js 15 pattern)
                const products = await searchProductsAction(debouncedQuery);
                setResults(products);
            } catch (error) {
                console.error("Search action failed", error);
                setResults([]);
            } finally {
                setLoading(false);
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
                        className="fixed inset-0 z-[100] bg-foreground/30 backdrop-blur-md"
                    />

                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-12 md:pt-24 pointer-events-none px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, ease: "circOut" }}
                            className="w-full max-w-3xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl pointer-events-auto overflow-hidden ring-1 ring-border"
                        >
                            <div className="flex items-center border-b border-border px-6 py-6 bg-muted/30">
                                <Search className="mr-4 h-5 w-5 text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search our collection..."
                                    className="flex-1 bg-transparent text-xl outline-none placeholder:text-muted-foreground/40 text-foreground font-light tracking-wide"
                                />
                                <button type="button" onClick={closeSearch} className="hover:bg-muted p-2 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="max-h-[65vh] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-muted-foreground text-xs uppercase tracking-widest animate-pulse">Searching collection...</p>
                                    </div>
                                ) : results.length > 0 ? (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">All Results</h3>
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
                                    <div className="py-16 text-center text-muted-foreground">
                                        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/30 mb-4" />
                                        <p className="text-lg font-light">No products found.</p>
                                    </div>
                                ) : (
                                    <div className="py-16 text-center text-muted-foreground/60">
                                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-muted mb-4">
                                            <Sparkles className="h-6 w-6 text-accent" />
                                        </div>
                                        <p className="text-sm font-light">Try &quot;leather sofa&quot; or search by name</p>
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

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "flex items-center gap-4 p-3 rounded-md cursor-pointer transition-all group border bg-transparent border-transparent hover:bg-muted hover:border-border"
            )}
        >
            <div className="relative w-16 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0 border border-border">
                {product.images?.[0] && (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium text-sm truncate transition-colors text-foreground/80 group-hover:text-foreground">
                        {product.name}
                    </h4>
                </div>

                <p className="text-muted-foreground text-xs truncate font-light">{product.category}</p>
            </div>
            <div className="text-right pl-2">
                <p className="text-foreground font-medium text-sm tracking-wide">{formatPrice(product.price)}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
        </div>
    );
}

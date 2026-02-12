"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, ArrowRight, Mic, MicOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

const VoiceSearch = ({ onResult }: { onResult: (text: string) => void }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            setIsSupported(true);
        }
    }, []);

    const startListening = () => {
        if (!isSupported) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (!isSupported) return null;

    return (
        <button
            onClick={startListening}
            className={`p-2 rounded-full transition-colors ${isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/40 hover:text-white"}`}
            title="Voice Search"
        >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
    );
};

interface SearchResult {
    id: string;
    name: string;
    price: number;
    images: string[];
    mainCategory: string;
    stockQuantity: number;
    category: { name: string } | null;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Debounced search
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setTotal(0);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
            const data = await response.json();
            setResults(data.products || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            handleSearch(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, handleSearch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-white/10 shadow-2xl">
                {/* Search Input */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-white/10">
                    <Search className="w-5 h-5 text-white/40" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search timepieces..."
                        className="flex-1 bg-transparent text-white text-lg placeholder:text-white/30 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                        ) : query && (
                            <button onClick={() => setQuery("")} className="p-1 hover:bg-white/10 rounded">
                                <X className="w-4 h-4 text-white/40" />
                            </button>
                        )}
                        <VoiceSearch onResult={(text) => setQuery(text)} />
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white/5 text-white/30 text-xs rounded">
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {results.length === 0 && query && !isLoading && (
                        <div className="p-12 text-center">
                            <p className="text-white/40">No results found for &quot;{query}&quot;</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="divide-y divide-white/5">
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/shop/${product.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group"
                                >
                                    {/* Image */}
                                    <div className="w-16 h-16 bg-white/5 flex-shrink-0 relative overflow-hidden">
                                        {product.images[0] && (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate group-hover:text-white transition-colors">
                                            {product.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm text-white/50">{formatPrice(product.price)}</span>
                                            <span className="text-xs text-white/30 uppercase tracking-widest">
                                                {product.category?.name || product.mainCategory}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {total > results.length && (
                    <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02]">
                        <Link
                            href={`/shop?search=${encodeURIComponent(query)}`}
                            onClick={onClose}
                            className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2"
                        >
                            View all {total} results <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

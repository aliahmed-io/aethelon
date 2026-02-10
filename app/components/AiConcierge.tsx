"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Orbit, ChevronRight, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { chatWithConcierge } from "@/app/store/concierge-actions";
import { Product } from "@/lib/assistantTypes";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Message = {
    role: "user" | "assistant";
    parts: { text: string }[];
    products?: Product[];
};

type ViewMode = "compact" | "sidebar";

import { usePathname } from "next/navigation";

export function AiConcierge() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("compact");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Hide on dashboard/admin pages
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { role: "user", parts: [{ text: inputValue }] };
        const newHistory = [...messages, userMsg];

        setMessages(newHistory);
        setInputValue("");
        setIsTyping(true);

        // Simulate "thinking" time for premium feel
        await new Promise(resolve => setTimeout(resolve, 600));

        const response = await chatWithConcierge(newHistory, inputValue);

        // Cast response products to local Product interface
        const recommendedProducts = response.products as unknown as Product[] | undefined;

        setIsTyping(false);
        if (response.success && response.message) {
            setMessages(prev => [...prev, {
                role: "assistant",
                parts: [{ text: response.message }],
                products: recommendedProducts
            }]);
        } else {
            setMessages(prev => [...prev, { role: "assistant", parts: [{ text: response.message || "I apologize, but I am unable to access the archives at this moment." }] }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Variants for view modes
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            width: viewMode === "compact" ? 380 : 450,
            height: viewMode === "compact" ? 600 : "95vh",
            right: viewMode === "compact" ? 32 : 0,
            bottom: viewMode === "compact" ? 32 : 0,
            borderRadius: viewMode === "compact" ? 24 : 0,
            borderTopLeftRadius: viewMode === "compact" ? 24 : 0, // Reset for sidebar
            borderBottomLeftRadius: viewMode === "compact" ? 24 : 0, // Reset for sidebar
        },
        exit: { opacity: 0, scale: 0.9, y: 20 }
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        layoutId="concierge-trigger"
                        className="fixed bottom-8 right-8 z-[60] group"
                        onClick={() => setIsOpen(true)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative w-14 h-14 bg-[#0a0a0a] border border-white/10 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md">
                            <Orbit className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors duration-500 animate-[spin_10s_linear_infinite]" />
                            {/* Pulse Dot - Only visible on hover or if active, now White/Silver */}
                            <span className="absolute top-0 right-0 w-2 h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-400" />
                            </span>
                        </div>
                        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/50 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/5">
                            Concierge
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed z-[60] bg-[#050505]/80 backdrop-blur-[20px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                        style={{
                            maxWidth: '100vw',
                        }}
                    >
                        {/* Header - Glass Bar */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-black border border-white/10 flex items-center justify-center">
                                    <Orbit className="w-4 h-4 text-white/70 animate-[spin_8s_linear_infinite]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">Velorum AI</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setViewMode(viewMode === "compact" ? "sidebar" : "compact")}
                                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                                    title={viewMode === "compact" ? "Expand" : "Minimize"}
                                >
                                    {viewMode === "compact" ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Body - Hidden Scrollbar */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
                                    <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                                        <Orbit className="w-8 h-8 text-white/20 animate-[spin_20s_linear_infinite]" />
                                    </div>
                                    <p className="text-sm font-light text-white/60 max-w-[200px] leading-relaxed">
                                        Ask about our complications, material origins, or request a styling consultation.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={clsx(
                                        "flex flex-col max-w-[85%]", // Keep max-width constraint for bubbles, but allow carousel to break it
                                        msg.role === "user" ? "self-end items-end" : "self-start items-start w-full"
                                    )}
                                >
                                    <div className={clsx(
                                        "px-5 py-3 text-sm leading-relaxed tracking-wide mb-2", // Added mb-2
                                        msg.role === "user"
                                            ? "bg-white text-black rounded-2xl rounded-tr-sm font-medium self-end" // Ensure user bubble aligns right
                                            : "bg-white/5 text-zinc-200 border border-white/5 rounded-2xl rounded-tl-sm font-light backdrop-blur-sm self-start max-w-[85%]" // Standard constraint for text
                                    )}>
                                        {msg.parts[0].text}
                                    </div>

                                    {/* Product Carousel */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="w-full overflow-x-auto pb-4 pt-2 -mx-6 px-6 scrollbar-none snap-x flex gap-4">
                                            {msg.products.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="snap-center shrink-0 w-[200px] bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden group cursor-pointer hover:border-white/30 transition-all"
                                                >
                                                    <Link href={`/shop/${product.id}`} target="_blank">
                                                        <div className="relative h-[200px] bg-white/5 p-4 flex items-center justify-center">
                                                            {product.images && product.images[0] && (
                                                                <Image
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate w-[70%]">{product.name}</h4>
                                                                <span className="text-[10px] text-white/60">{formatPrice(product.price)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[9px] text-white/40 uppercase tracking-widest">
                                                                <span>View Details</span>
                                                                <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <span className="text-[9px] uppercase tracking-wider text-white/20 px-1 font-mono self-start ml-1">
                                        {msg.role === "user" ? "Client" : "Concierge"}
                                    </span>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="self-start"
                                >
                                    <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1 items-center h-[42px]">
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area - Spotlight Style */}
                        <div className="p-5 border-t border-white/5 bg-[#050505]/50 backdrop-blur-md">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                                <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-full px-1 py-1 focus-within:border-white/20 transition-all shadow-lg">
                                    <input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your inquiry..."
                                        className="bg-transparent border-none focus:outline-none text-sm text-white placeholder-zinc-600 flex-1 min-w-0 px-4 h-10 tracking-wide font-light"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputValue.trim()}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-[9px] text-white/20 text-center mt-3 font-mono uppercase tracking-widest">
                                AI-Powered Assistant • Velorum Geneve
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

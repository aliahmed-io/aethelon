'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { chatWithConcierge } from '@/app/store/concierge-actions';
import { Product } from '@/lib/assistantTypes';
import { formatPrice } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface Message {
    id: number;
    type: 'user' | 'ai';
    text: string;
    products?: Product[];
    imagePreview?: string;
}

interface AttachedImage {
    preview: string;
    base64: string;
    mimeType: string;
}

/** Aethelon diamond icon — a geometric gem SVG unique to the brand */
function AethelonGemIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Top facets */}
            <path d="M12 2L4 8h16L12 2z" />
            {/* Lower gem body */}
            <path d="M4 8l8 14L20 8" />
            {/* Center highlight */}
            <path d="M8 8l4 14 4-14" />
            {/* Crown line */}
            <line x1="4" y1="8" x2="20" y2="8" />
        </svg>
    );
}

export default function Chatbot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, type: 'ai', text: "Welcome to Aethelon. I'm your personal concierge — ask me anything about our collections, materials, or styling." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // Hide on dashboard/admin pages
    if (pathname?.startsWith('/dashboard')) {
        return null;
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return;
        }

        // Max 4MB
        if (file.size > 4 * 1024 * 1024) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Extract base64 data (remove data:image/...;base64, prefix)
            const base64 = result.split(',')[1];
            setAttachedImage({
                preview: result,
                base64,
                mimeType: file.type,
            });
        };
        reader.readAsDataURL(file);

        // Reset file input so same file can be re-selected
        e.target.value = '';
    };

    const removeAttachment = () => {
        setAttachedImage(null);
    };

    const handleSend = async () => {
        if (!input.trim() && !attachedImage) return;

        const userMsg: Message = {
            id: Date.now(),
            type: 'user',
            text: input || (attachedImage ? 'Sent an image' : ''),
            imagePreview: attachedImage?.preview,
        };

        const imageForApi = attachedImage ? { base64: attachedImage.base64, mimeType: attachedImage.mimeType } : null;

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setAttachedImage(null);
        setIsTyping(true);

        // Convert to the format expected by chatWithConcierge (text-only history)
        const chatHistory = updatedMessages.map(m => ({
            role: m.type === 'user' ? 'user' as const : 'assistant' as const,
            parts: [{ text: m.text }],
        }));

        const response = await chatWithConcierge(chatHistory, input || 'What do you see in this image?', imageForApi);
        const recommendedProducts = response.products as unknown as Product[] | undefined;

        setIsTyping(false);

        const aiMsg: Message = {
            id: Date.now() + 1,
            type: 'ai',
            text: response.success && response.message
                ? response.message
                : response.message || 'I apologize, but I am unable to assist at this moment. Please try again.',
            products: recommendedProducts,
        };
        setMessages(prev => [...prev, aiMsg]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Custom FAB — Aethelon gem icon with subtle breathe animation */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed bottom-6 right-6 z-40 bg-accent text-accent-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow group"
                        onClick={() => setIsOpen(true)}
                        aria-label="Open concierge chat"
                    >
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            {/* Outer pulse ring */}
                            <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping [animation-duration:3s]" />
                            {/* Gem icon with slow spin on hover */}
                            <AethelonGemIcon className="w-6 h-6 relative z-10 transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-6 right-6 w-full max-w-sm bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col h-[520px]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/60 to-accent border border-accent/30 flex items-center justify-center">
                                        <AethelonGemIcon className="w-5 h-5 text-accent-foreground" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Aethelon Concierge</h3>
                                    <p className="text-xs text-muted-foreground">AI Assistant • Online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Close chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none [scrollbar-width:none]">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className="flex flex-col max-w-[85%] gap-2">
                                        {/* User image attachment preview */}
                                        {msg.imagePreview && (
                                            <div className="rounded-xl overflow-hidden border border-border self-end">
                                                <Image
                                                    src={msg.imagePreview}
                                                    alt="Attached image"
                                                    width={200}
                                                    height={200}
                                                    className="object-cover max-h-40 w-auto"
                                                />
                                            </div>
                                        )}

                                        <div
                                            className={`rounded-2xl p-3 text-sm leading-relaxed ${msg.type === 'user'
                                                ? 'bg-accent text-accent-foreground rounded-br-none font-medium'
                                                : 'bg-muted text-foreground border border-border rounded-bl-none'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>

                                        {/* Product Cards — horizontally scrollable carousel */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1">
                                                    {msg.products.length} recommendation{msg.products.length > 1 ? 's' : ''}
                                                </span>
                                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
                                                    {msg.products.map(product => (
                                                        <Link
                                                            key={product.id}
                                                            href={`/shop/${product.id}`}
                                                            className="snap-start shrink-0 w-[140px] bg-background border border-border rounded-xl overflow-hidden group hover:border-accent/30 hover:shadow-md transition-all"
                                                        >
                                                            <div className="aspect-square bg-muted/50 relative">
                                                                {product.images && product.images[0] && (
                                                                    <Image
                                                                        src={product.images[0]}
                                                                        alt={product.name}
                                                                        fill
                                                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="p-2">
                                                                <div className="font-bold text-[11px] text-foreground truncate leading-tight">{product.name}</div>
                                                                <div className="text-[11px] text-accent font-medium mt-0.5">{formatPrice(product.price)}</div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-muted border border-border px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Attachment Preview Strip */}
                        <AnimatePresence>
                            {attachedImage && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-border px-3 pt-2 pb-1 bg-muted/20 overflow-hidden"
                                >
                                    <div className="inline-flex items-start gap-1">
                                        <div className="relative rounded-lg overflow-hidden border border-border">
                                            <Image
                                                src={attachedImage.preview}
                                                alt="Attachment preview"
                                                width={56}
                                                height={56}
                                                className="object-cover w-14 h-14"
                                            />
                                        </div>
                                        <button
                                            onClick={removeAttachment}
                                            className="text-muted-foreground hover:text-foreground -ml-2 -mt-1"
                                            aria-label="Remove attachment"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className="p-3 border-t border-border bg-muted/20">
                            <div className="flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border focus-within:border-accent/40 transition-colors shadow-sm">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={attachedImage ? "Add a message..." : "Ask anything..."}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 tracking-wide"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`transition-colors ${attachedImage ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                                    aria-label="Attach image"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={(!input.trim() && !attachedImage) || isTyping}
                                    className="bg-accent text-accent-foreground p-1.5 rounded-full hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
                                    aria-label="Send message"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

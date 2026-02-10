'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Image as ImageIcon } from 'lucide-react';
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
}

export default function Chatbot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, type: 'ai', text: "Welcome to Aethelon. I'm your personal concierge — ask me anything about our collections, materials, or styling." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Hide on dashboard/admin pages
    if (pathname?.startsWith('/dashboard')) {
        return null;
    }

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), type: 'user', text: input };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        // Convert to the format expected by chatWithConcierge
        const chatHistory = updatedMessages.map(m => ({
            role: m.type === 'user' ? 'user' as const : 'assistant' as const,
            parts: [{ text: m.text }],
        }));

        const response = await chatWithConcierge(chatHistory, input);
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
            {/* Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="fixed bottom-6 right-6 z-40 bg-accent text-accent-foreground p-4 rounded-full shadow-lg hover:bg-accent/90 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                    >
                        <MessageSquare className="w-6 h-6" />
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
                                        <span className="text-accent-foreground font-bold text-sm">A</span>
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
                                        <div
                                            className={`rounded-2xl p-3 text-sm leading-relaxed ${msg.type === 'user'
                                                ? 'bg-accent text-accent-foreground rounded-br-none font-medium'
                                                : 'bg-muted text-foreground border border-border rounded-bl-none'
                                                }`}
                                        >
                                            <p>{msg.text}</p>
                                        </div>

                                        {/* Product Cards */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                                                {msg.products.map(product => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/shop/${product.id}`}
                                                        className="snap-start shrink-0 w-[160px] bg-background border border-border rounded-xl overflow-hidden group hover:border-accent/30 transition-all"
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
                                                            <div className="font-bold text-xs text-foreground truncate">{product.name}</div>
                                                            <div className="text-xs text-accent font-medium">{formatPrice(product.price)}</div>
                                                        </div>
                                                    </Link>
                                                ))}
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

                        {/* Input Area */}
                        <div className="p-3 border-t border-border bg-muted/20">
                            <div className="flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border focus-within:border-accent/40 transition-colors shadow-sm">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 tracking-wide"
                                    autoFocus={isOpen}
                                />
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="bg-accent text-accent-foreground p-1.5 rounded-full hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
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

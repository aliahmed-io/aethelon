'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Image as ImageIcon, Mic } from 'lucide-react';
import Image from 'next/image';

interface Message {
    id: number;
    type: 'user' | 'ai';
    text: string;
    suggestion?: {
        title: string;
        image: string;
        price: string;
    };
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, type: 'ai', text: 'Hello! I\'m Elena, your design concierge. How can I help you transform your space today?' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        // User message
        const userMsg: Message = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulated AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: Date.now() + 1,
                type: 'ai',
                text: 'That sounds lovely. Would you like to see some velvet sofas that match that aesthetic?',
                suggestion: {
                    title: "Orbit Velvet Sofa",
                    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2670&auto=format&fit=crop",
                    price: "$3,200"
                }
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-full max-w-sm bg-background/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/50 overflow-hidden">
                                    {/* Placeholder Avatar */}
                                    <div className="w-full h-full bg-gradient-to-br from-accent to-primary" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-sm">Elena</h3>
                                <p className="text-xs text-muted-foreground">Design Expert • Online</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.type === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-white/10 border border-white/10 rounded-bl-none'
                                            }`}
                                    >
                                        <p>{msg.text}</p>
                                        {msg.suggestion && (
                                            <div className="mt-3 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                                <div className="aspect-video bg-muted relative">
                                                    <Image
                                                        src={msg.suggestion.image}
                                                        alt={msg.suggestion.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="p-2">
                                                    <div className="font-bold text-xs">{msg.suggestion.title}</div>
                                                    <div className="text-xs text-accent">{msg.suggestion.price}</div>
                                                    <button className="w-full mt-2 bg-accent text-accent-foreground py-1.5 rounded text-xs font-bold hover:opacity-90">View in 3D</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-white/10 bg-white/5">
                            <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2 border border-white/10 focus-within:border-accent/50 transition-colors">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Message Elena..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                                />
                                <button className="text-muted-foreground hover:text-foreground">
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="bg-accent text-accent-foreground p-1.5 rounded-full hover:scale-105 transition-transform"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

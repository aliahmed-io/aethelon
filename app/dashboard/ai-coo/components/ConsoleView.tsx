"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface ConsoleViewProps {
    messages: ChatMessage[];
    input: string;
    setInput: (val: string) => void;
    isLoading: boolean;
    onSend: () => void;
}

export function ConsoleView({ messages, input, setInput, isLoading, onSend }: ConsoleViewProps) {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="h-full flex flex-col w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="flex-none mb-6">
                <h2 className="text-2xl font-light uppercase tracking-tight text-white flex items-center gap-3">
                    <Brain className="w-6 h-6 text-white/60" /> Live Console
                </h2>
                <p className="text-white/40 text-xs mt-1">Direct Interface to Aethelon Intelligence Core</p>
            </div>

            <div className="flex-1 bg-black/40 border border-white/10 rounded-sm overflow-hidden flex flex-col relative">
                <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none">
                            <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Brain className="w-8 h-8" />
                            </div>
                            <p className="text-sm uppercase tracking-[0.3em]">System Online</p>
                            <p className="text-[10px] mt-2 tracking-wider">Ready for input</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] px-6 py-4 border rounded-sm ${msg.role === "user"
                                    ? "bg-white text-black border-white shadow-lg shadow-white/5"
                                    : "bg-zinc-900/80 text-zinc-300 border-white/10 backdrop-blur-sm"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-[10px] uppercase tracking-widest opacity-40">
                                        <Brain className="w-3 h-3" /> Aethelon Intelligence
                                    </div>
                                )}
                                <div className="text-sm leading-relaxed font-light markdown-prose">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-900 border border-white/10 px-6 py-4 flex items-center gap-3 rounded-sm">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-white/40 ml-2">Processing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-950/80 backdrop-blur border-t border-white/10 z-10">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSend();
                        }}
                        className="relative flex items-center max-w-4xl mx-auto"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter command or query..."
                            disabled={isLoading}
                            className="w-full bg-black/60 border-white/10 text-white placeholder:text-white/20 h-14 pl-6 pr-16 rounded-sm focus-visible:ring-1 focus-visible:ring-white/30 text-sm font-mono"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 bg-white text-black hover:bg-zinc-200 h-10 w-10 rounded-sm p-0 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

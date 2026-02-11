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
                <h2 className="text-2xl font-light uppercase tracking-tight text-foreground flex items-center gap-3">
                    <Brain className="w-6 h-6 text-muted-foreground" /> Live Console
                </h2>
                <p className="text-muted-foreground text-xs mt-1">Direct Interface to Aethelon Intelligence Core</p>
            </div>

            <div className="flex-1 bg-card border border-border rounded-sm overflow-hidden flex flex-col relative shadow-sm">
                <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none">
                            <div className="w-24 h-24 border border-foreground/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Brain className="w-8 h-8 text-foreground" />
                            </div>
                            <p className="text-sm uppercase tracking-[0.3em] text-foreground">System Online</p>
                            <p className="text-[10px] mt-2 tracking-wider text-muted-foreground">Ready for input</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] px-6 py-4 border rounded-sm ${msg.role === "user"
                                    ? "bg-foreground text-background border-foreground shadow-lg"
                                    : "bg-muted text-foreground border-border"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-foreground/10 text-[10px] uppercase tracking-widest opacity-40">
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
                            <div className="bg-muted border border-border px-6 py-4 flex items-center gap-3 rounded-sm">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground ml-2">Processing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t border-border z-10">
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
                            className="w-full bg-muted/50 border-border text-foreground placeholder:text-muted-foreground h-14 pl-6 pr-16 rounded-sm focus-visible:ring-1 focus-visible:ring-foreground/20 text-sm font-mono"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 bg-foreground text-background hover:bg-foreground/90 h-10 w-10 rounded-sm p-0 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

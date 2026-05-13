"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowUpRight } from "lucide-react";

interface AuthPromptContextType {
    showAuthPrompt: (message?: string) => void;
    hideAuthPrompt: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextType>({
    showAuthPrompt: () => {},
    hideAuthPrompt: () => {},
});

export function useAuthPrompt() {
    return useContext(AuthPromptContext);
}

export function AuthPromptProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    const showAuthPrompt = useCallback((msg?: string) => {
        setMessage(
            msg ||
            "This feature requires an account, which is not available in the demo."
        );
        setIsOpen(true);
    }, []);

    const hideAuthPrompt = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <AuthPromptContext.Provider value={{ showAuthPrompt, hideAuthPrompt }}>
            {children}

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={hideAuthPrompt}
                            className="fixed inset-0 z-[9990] bg-foreground/60 backdrop-blur-sm"
                            data-cursor-restore
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-0 z-[9991] flex items-center justify-center p-4"
                            data-cursor-restore
                        >
                            <div className="relative w-full max-w-md bg-background border border-border shadow-2xl rounded-sm overflow-hidden">
                                {/* Decorative accent stripe */}
                                <div className="h-1 w-full bg-gradient-to-r from-accent/0 via-accent to-accent/0" />

                                {/* Close button */}
                                <button
                                    onClick={hideAuthPrompt}
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                                    aria-label="Close demo notice"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="p-8 md:p-10 space-y-6">
                                    {/* Icon + Brand header */}
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-accent" />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                                                Live Demo
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-serif text-foreground tracking-tight leading-tight">
                                            You&apos;re Exploring a<br />Design Showcase
                                        </h2>
                                    </div>

                                    {/* Message */}
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {message}
                                    </p>

                                    {/* Capability list */}
                                    <div className="rounded-sm border border-border/50 bg-secondary/30 p-4 space-y-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            What&apos;s included in this demo
                                        </p>
                                        <ul className="space-y-1.5 text-sm text-foreground/80">
                                            {[
                                                "Full product catalog & search",
                                                "3D product visualization & AR",
                                                "AI-powered shopping assistant",
                                                "Responsive design across all devices",
                                            ].map((item) => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* CTA */}
                                    <div className="space-y-3 pt-1">
                                        <button
                                            onClick={hideAuthPrompt}
                                            className="flex w-full items-center justify-center gap-2 rounded-sm bg-foreground px-4 py-3 text-sm font-bold uppercase tracking-widest text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98]"
                                        >
                                            Continue Exploring
                                        </button>

                                        <a
                                            href="mailto:contact@aethelonlabs.com"
                                            className="flex w-full items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-secondary active:scale-[0.98]"
                                        >
                                            Inquire About This Build
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </a>
                                    </div>

                                    {/* Footer */}
                                    <p className="text-center text-[11px] text-muted-foreground/50">
                                        Aethelon is a concept storefront built to demonstrate
                                        production-grade e-commerce capabilities.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AuthPromptContext.Provider>
    );
}

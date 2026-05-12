"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

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
        setMessage(msg || "Sign in to unlock your personal vault and save your favorite pieces.");
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
                            <div className="relative w-full max-w-sm bg-background border border-border shadow-2xl rounded-sm overflow-hidden">
                                {/* Decorative accent stripe */}
                                <div className="h-1 w-full bg-gradient-to-r from-accent/0 via-accent to-accent/0" />

                                {/* Close button */}
                                <button
                                    onClick={hideAuthPrompt}
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Close authentication prompt"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="p-8 space-y-6">
                                    {/* Brand header */}
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                                            Aethelon
                                        </p>
                                        <h2 className="text-xl font-serif text-foreground tracking-tight">
                                            Authentication Required
                                        </h2>
                                    </div>

                                    {/* Message */}
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {message}
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="space-y-3 pt-2">
                                        <Link
                                            href="/login"
                                            onClick={hideAuthPrompt}
                                            className="flex w-full items-center justify-center gap-2 rounded-sm bg-foreground px-4 py-3 text-sm font-bold uppercase tracking-widest text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98]"
                                        >
                                            Sign In
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>

                                        <Link
                                            href="/register"
                                            onClick={hideAuthPrompt}
                                            className="flex w-full items-center justify-center rounded-sm border border-border px-4 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-secondary active:scale-[0.98]"
                                        >
                                            Create an Account
                                        </Link>
                                    </div>

                                    {/* Footer */}
                                    <p className="text-center text-[11px] text-muted-foreground/50">
                                        Continue browsing — no account needed to explore.
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

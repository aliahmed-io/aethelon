"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

type ModalVariant = "auth" | "demo";

interface AuthPromptContextType {
    showAuthPrompt: (message?: string) => void;
    showDemoNotice: (message?: string) => void;
    hideAuthPrompt: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextType>({
    showAuthPrompt: () => {},
    showDemoNotice: () => {},
    hideAuthPrompt: () => {},
});

export function useAuthPrompt() {
    return useContext(AuthPromptContext);
}

export function AuthPromptProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [variant, setVariant] = useState<ModalVariant>("auth");
    const router = useRouter();

    const showAuthPrompt = useCallback((msg?: string) => {
        setMessage(
            msg ||
            "Sign in to access this feature and unlock your personalized experience."
        );
        setVariant("auth");
        setIsOpen(true);
    }, []);

    const showDemoNotice = useCallback((msg?: string) => {
        setMessage(
            msg ||
            "This feature is not available in the demo."
        );
        setVariant("demo");
        setIsOpen(true);
    }, []);

    const hideAuthPrompt = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleSignIn = useCallback(() => {
        setIsOpen(false);
        router.push("/login");
    }, [router]);

    const handleContinue = useCallback(() => {
        setIsOpen(false);
        router.push("/");
    }, [router]);

    return (
        <AuthPromptContext.Provider value={{ showAuthPrompt, showDemoNotice, hideAuthPrompt }}>
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
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="p-8 md:p-10 space-y-6">
                                    {variant === "auth" ? (
                                        /* ── Sign-In Required Modal ── */
                                        <>
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                                                    Aethelon
                                                </p>
                                                <h2 className="text-2xl font-serif text-foreground tracking-tight leading-tight">
                                                    Sign In Required
                                                </h2>
                                            </div>

                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {message}
                                            </p>

                                            <div className="space-y-3 pt-1">
                                                <button
                                                    onClick={handleSignIn}
                                                    className="flex w-full items-center justify-center gap-2 rounded-sm bg-foreground px-4 py-3 text-sm font-bold uppercase tracking-widest text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98]"
                                                >
                                                    Sign In
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={hideAuthPrompt}
                                                    className="flex w-full items-center justify-center rounded-sm border border-border px-4 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-accent/50 hover:bg-secondary active:scale-[0.98]"
                                                >
                                                    Continue Browsing
                                                </button>
                                            </div>

                                            <p className="text-center text-[11px] text-muted-foreground/50">
                                                No account needed to browse the catalog.
                                            </p>
                                        </>
                                    ) : (
                                        /* ── Demo Notice Modal ── */
                                        <>
                                            <div className="space-y-4">
                                                <div className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                                                        Live Demo
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl font-serif text-foreground tracking-tight leading-tight">
                                                    You&apos;re Exploring a<br />Design Showcase
                                                </h2>
                                            </div>

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
                                                        "Responsive design across all devices",
                                                    ].map((item) => (
                                                        <li key={item} className="flex items-start gap-2">
                                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Disabled features */}
                                            <div className="rounded-sm border border-border/50 bg-destructive/5 p-4 space-y-2.5">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                    Disabled in this demo
                                                </p>
                                                <ul className="space-y-1.5 text-sm text-foreground/60">
                                                    {[
                                                        "Authentication & account management",
                                                        "AI chatbot & AI-powered search",
                                                        "Wishlist, cart & checkout flow",
                                                    ].map((item) => (
                                                        <li key={item} className="flex items-start gap-2">
                                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <button
                                                onClick={handleContinue}
                                                className="flex w-full items-center justify-center gap-2 rounded-sm bg-foreground px-4 py-3 text-sm font-bold uppercase tracking-widest text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98]"
                                            >
                                                Continue Exploring
                                            </button>

                                            <p className="text-center text-[11px] text-muted-foreground/50">
                                                Aethelon is a concept storefront built to demonstrate
                                                production-grade e-commerce capabilities.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AuthPromptContext.Provider>
    );
}

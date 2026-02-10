"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Delay for cinematic entrance
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="fixed bottom-4 inset-x-4 md:bottom-8 md:right-8 md:left-auto md:max-w-md z-50 p-6 bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl"
                >
                    <div className="flex flex-col gap-4">
                        <div>
                            <h4 className="text-white font-medium mb-1">We respect your privacy.</h4>
                            <p className="text-sm text-white/50 leading-relaxed">
                                We use cookies to enhance your experience and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={acceptCookies}
                                className="flex-1 bg-white text-black hover:bg-white/90 rounded-sm"
                            >
                                Accept
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsVisible(false)}
                                className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-sm"
                            >
                                Decline
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

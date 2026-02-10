"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "aethelona_cookie_consent";

export function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== "accepted") {
            setVisible(true);
        }
    }, []);

    const accept = () => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                    We use cookies and similar technologies to improve your experience and, when enabled,
                    to support analytics and performance monitoring. By continuing to use this site, you
                    agree to our use of cookies as described in our Privacy Policy.
                </div>
                <div className="flex-shrink-0">
                    <Button size="sm" onClick={accept}>
                        I understand
                    </Button>
                </div>
            </div>
        </div>
    );
}

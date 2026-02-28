"use client";

import { useState, useEffect } from "react";

export interface DeviceCapabilities {
    isSecureContext: boolean;
    isMobile: boolean;
    loading: boolean;
}

export function useCapabilities() {
    const [caps, setCaps] = useState<DeviceCapabilities>({
        isSecureContext: false,
        isMobile: false,
        loading: true,
    });

    useEffect(() => {
        const checkCapabilities = async () => {
            const isSecure = window.isSecureContext;

            function detectMobile(): boolean {
                if (typeof window === "undefined") return false;

                // Check touch + screen width (most reliable combo)
                const hasTouch = navigator.maxTouchPoints > 0;
                const isNarrow = window.innerWidth <= 1024;

                // UA fallback for edge cases
                const ua = navigator.userAgent;
                const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

                return (hasTouch && isNarrow) || uaMobile;
            }

            const isMobile = detectMobile();

            setCaps({
                isSecureContext: isSecure,
                isMobile,
                loading: false,
            });
        };

        checkCapabilities();
    }, []);

    return caps;
}

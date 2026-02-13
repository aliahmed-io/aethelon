"use client";

import { useState, useEffect } from "react";

export interface DeviceCapabilities {
    isWebXrSupported: boolean;
    isSecureContext: boolean;
    isMobile: boolean;
    loading: boolean;
}

export function useCapabilities() {
    const [caps, setCaps] = useState<DeviceCapabilities>({
        isWebXrSupported: false,
        isSecureContext: false,
        isMobile: false,
        loading: true,
    });

    useEffect(() => {
        const checkCapabilities = async () => {
            const isSecure = window.isSecureContext;
            const ua = navigator.userAgent;
            const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

            let isWebXr = false;
            // @ts-ignore - navigator.xr is not fully typed in standard lib yet
            if (navigator.xr && navigator.xr.isSessionSupported) {
                try {
                    // @ts-ignore
                    isWebXr = await navigator.xr.isSessionSupported("immersive-ar");
                } catch (e) {
                    console.warn("WebXR check failed", e);
                }
            }

            setCaps({
                isWebXrSupported: isWebXr,
                isSecureContext: isSecure,
                isMobile,
                loading: false,
            });
        };

        checkCapabilities();
    }, []);

    return caps;
}

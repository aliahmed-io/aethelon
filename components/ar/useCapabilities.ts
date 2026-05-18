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


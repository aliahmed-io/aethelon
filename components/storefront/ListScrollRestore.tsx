"use client";

import { useEffect } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import { consumeScrollRestore } from "@/lib/navigation/list-return";

export function ListScrollRestore() {
    const lenis = useLenis();

    useEffect(() => {
        const y = consumeScrollRestore();
        if (y == null || y <= 0) return;

        const restore = () => {
            if (lenis) {
                lenis.scrollTo(y, { immediate: true });
            } else {
                window.scrollTo({ top: y, left: 0, behavior: "auto" });
            }
        };

        requestAnimationFrame(() => {
            requestAnimationFrame(restore);
        });
    }, [lenis]);

    return null;
}

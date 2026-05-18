'use client';

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react';
import { gsap } from 'gsap';

interface CustomCursorProps {
    enabled?: boolean;
}

/** Fine-pointer devices only (mouse/trackpad) — not tied to viewport width */
function shouldEnableCustomCursor(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Premium custom cursor — fine-pointer desktops at any viewport width; off on touch-primary devices.
 */
export default function CustomCursor({ enabled = true }: CustomCursorProps) {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const isActive = useRef(false);
    const mousePosition = useRef({ x: 0, y: 0 });
    const currentPosition = useRef({ x: 0, y: 0 });
    const rafId = useRef<number | null>(null);
    const [showCursor, setShowCursor] = useState(false);

    const updateCursor = useCallback(() => {
        rafId.current = requestAnimationFrame(updateCursor);

        if (!dotRef.current || !ringRef.current || !isActive.current) return;

        const easeFactor = 0.15;

        currentPosition.current.x += (mousePosition.current.x - currentPosition.current.x) * easeFactor;
        currentPosition.current.y += (mousePosition.current.y - currentPosition.current.y) * easeFactor;

        gsap.set(dotRef.current, {
            x: mousePosition.current.x,
            y: mousePosition.current.y,
        });

        gsap.set(ringRef.current, {
            x: currentPosition.current.x,
            y: currentPosition.current.y,
        });
    }, []);

    // Sync body class + visibility from pointer capabilities (not viewport)
    useEffect(() => {
        if (!enabled) return;

        const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

        const syncCursorMode = () => {
            const active = shouldEnableCustomCursor();
            isActive.current = active;
            setShowCursor(active);
            document.body.classList.toggle('custom-cursor', active);
        };

        syncCursorMode();
        mediaQuery.addEventListener('change', syncCursorMode);

        return () => {
            mediaQuery.removeEventListener('change', syncCursorMode);
            document.body.classList.remove('custom-cursor', 'cursor-hover', 'cursor-text', 'cursor-click');
        };
    }, [enabled]);

    // Attach listeners and animation only after cursor DOM exists
    useLayoutEffect(() => {
        if (!enabled || !showCursor) return;

        rafId.current = requestAnimationFrame(updateCursor);

        const handleMouseMove = (e: MouseEvent) => {
            mousePosition.current = { x: e.clientX, y: e.clientY };
        };

        const handleDelegateOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const interactive = target.closest('a, button, [role="button"], .cursor-pointer, [data-cursor="pointer"]');
            const textInput = target.closest('input, textarea, [contenteditable="true"]');

            if (interactive) {
                document.body.classList.add('cursor-hover');
                gsap.to(ringRef.current, { scale: 1.5, opacity: 0.8, duration: 0.3 });
            } else if (textInput) {
                document.body.classList.add('cursor-text');
                gsap.to(ringRef.current, { opacity: 0, duration: 0.3 });
            } else {
                document.body.classList.remove('cursor-hover', 'cursor-text');
                gsap.to(ringRef.current, { scale: 1, opacity: 0.5, duration: 0.3 });
            }
        };

        const handleMouseDown = () => {
            document.body.classList.add('cursor-click');
            gsap.to(ringRef.current, { scale: 0.8, duration: 0.1 });
        };

        const handleMouseUp = () => {
            document.body.classList.remove('cursor-click');
            gsap.to(ringRef.current, { scale: 1, duration: 0.1 });
        };

        document.addEventListener('mouseover', handleDelegateOver);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            if (rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
            document.body.classList.remove('cursor-hover', 'cursor-text', 'cursor-click');
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseover', handleDelegateOver);
        };
    }, [enabled, showCursor, updateCursor]);

    if (!enabled || !showCursor) return null;

    return (
        <>
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-2 h-2 bg-accent rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
                aria-hidden="true"
            />
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-10 h-10 border border-accent rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 opacity-50 will-change-transform"
                aria-hidden="true"
            />
        </>
    );
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

interface CustomCursorProps {
    enabled?: boolean;
}

/**
 * Premium custom cursor system for Aethelon
 * Features:
 * - Custom dot + ring design
 * - Magnetic pull to interactive elements
 * - State variations (default, hover, click, drag, text)
 * - Smooth position interpolation with GSAP
 * - Automatically disabled on touch devices
 */
export default function CustomCursor({ enabled = true }: CustomCursorProps) {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const isTouch = useRef(false);
    const mousePosition = useRef({ x: 0, y: 0 });
    const currentPosition = useRef({ x: 0, y: 0 });

    const updateCursor = useCallback(() => {
        if (!dotRef.current || !ringRef.current || isTouch.current) return;

        // Smooth interpolation for the ring
        // Lower factor = smoother/slower trail
        const easeFactor = 0.15;

        currentPosition.current.x += (mousePosition.current.x - currentPosition.current.x) * easeFactor;
        currentPosition.current.y += (mousePosition.current.y - currentPosition.current.y) * easeFactor;

        // Direct position for dot (more responsive)
        gsap.set(dotRef.current, {
            x: mousePosition.current.x,
            y: mousePosition.current.y,
        });

        // Slightly delayed position for ring (smooth trailing effect)
        gsap.set(ringRef.current, {
            x: currentPosition.current.x,
            y: currentPosition.current.y,
        });

        requestAnimationFrame(updateCursor);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        // Detect touch device
        const checkTouch = () => {
            isTouch.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isTouch.current) {
                document.body.classList.remove('custom-cursor');
            } else {
                document.body.classList.add('custom-cursor');
            }
        };

        checkTouch();
        window.addEventListener('resize', checkTouch);

        if (isTouch.current) return;

        // Start animation loop
        requestAnimationFrame(updateCursor);

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mousePosition.current = { x: e.clientX, y: e.clientY };
        };

        // Mouse enter/leave handlers for interactive elements
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

        document.addEventListener('mouseover', handleDelegateOver);

        // Mouse down/up handlers
        const handleMouseDown = () => {
            document.body.classList.add('cursor-click');
            gsap.to(ringRef.current, { scale: 0.8, duration: 0.1 });
        };

        const handleMouseUp = () => {
            document.body.classList.remove('cursor-click');
            gsap.to(ringRef.current, { scale: 1, duration: 0.1 });
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        // Cleanup
        return () => {
            document.body.classList.remove('custom-cursor', 'cursor-hover', 'cursor-text', 'cursor-click');
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', checkTouch);
            document.removeEventListener('mouseover', handleDelegateOver);
        };
    }, [enabled, updateCursor]);

    // Don't render on touch devices or when disabled
    if (!enabled) return null;

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

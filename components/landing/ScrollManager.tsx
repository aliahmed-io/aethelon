'use client';

import { useEffect, useRef } from 'react';
import { useScrollStore } from '@/lib/stores/scrollStore';

export default function ScrollManager() {
    const { setScrollProgress, setScrollVelocity, setActiveSection } = useScrollStore();
    const lastScrollY = useRef(0);
    const rafId = useRef<number>(0); // Initialize with 0

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

            // Calculate velocity
            const velocity = scrollY - lastScrollY.current;
            lastScrollY.current = scrollY;

            // Update store
            setScrollProgress(progress);
            setScrollVelocity(velocity);

            // Determine active section (assuming 4 sections for now)
            const sections = 4;
            const currentSection = Math.floor(progress * sections);
            setActiveSection(currentSection);
        };

        const loop = () => {
            handleScroll();
            rafId.current = requestAnimationFrame(loop);
        };

        window.addEventListener('scroll', handleScroll);
        loop(); // Start loop for smooth updates if needed, though scroll event is usually enough. 
        // Actually, let's stick to event listener for efficiency unless we need damping.
        cancelAnimationFrame(rafId.current); // Cancel the initial loop call to strictly use event listener for now to save resources.

        // Re-bind strictly to scroll for clarity
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafId.current);
        };
    }, [setScrollProgress, setScrollVelocity, setActiveSection]);

    return null; // Logic only component
}

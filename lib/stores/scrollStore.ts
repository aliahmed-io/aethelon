import { create } from 'zustand';

interface ScrollState {
    scrollProgress: number; // 0 to 1
    scrollVelocity: number;
    activeSection: number;
    setScrollProgress: (progress: number) => void;
    setScrollVelocity: (velocity: number) => void;
    setActiveSection: (section: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
    scrollProgress: 0,
    scrollVelocity: 0,
    activeSection: 0,
    setScrollProgress: (progress) => set({ scrollProgress: progress }),
    setScrollVelocity: (velocity) => set({ scrollVelocity: velocity }),
    setActiveSection: (section) => set({ activeSection: section }),
}));

/** Read current vertical scroll (Lenis root or window) */
export function getScrollY(): number {
    if (typeof window === "undefined") return 0;
    const lenis = (window as Window & { lenis?: { scroll: number } }).lenis;
    if (lenis && typeof lenis.scroll === "number") {
        return lenis.scroll;
    }
    return window.scrollY ?? document.documentElement.scrollTop ?? 0;
}

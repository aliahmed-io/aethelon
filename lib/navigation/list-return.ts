const STORAGE_KEY = "aethelon:list-return";
const MAX_AGE_MS = 30 * 60 * 1000;

export type ListReturnState = {
    path: string;
    scrollY: number;
    label: string;
    savedAt: number;
};

function isBrowser() {
    return typeof window !== "undefined";
}

/** Whether the path is a product listing page that should be saved as return context */
export function isListPagePath(pathname: string): boolean {
    if (pathname === "/shop" || pathname === "/categories") return true;
    return /^\/categories\/[^/]+$/.test(pathname);
}

/** Human-readable back label from a listing path */
export function labelFromListPath(path: string): string {
    try {
        const url = new URL(path, isBrowser() ? window.location.origin : "https://aethelon.com");
        if (url.pathname === "/shop") return "Back to Shop";
        if (url.pathname === "/categories") return "Back to Categories";
        const categoryMatch = url.pathname.match(/^\/categories\/([^/]+)$/);
        if (categoryMatch) {
            const slug = categoryMatch[1];
            if (slug === "all") return "Back to All Products";
            const name = slug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
            return `Back to ${name}`;
        }
    } catch {
        /* ignore */
    }
    return "Back";
}

export function saveListReturn(path: string, scrollY: number, label?: string) {
    if (!isBrowser()) return;
    const state: ListReturnState = {
        path,
        scrollY,
        label: label ?? labelFromListPath(path),
        savedAt: Date.now(),
    };
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        /* quota / private mode */
    }
}

export function getListReturn(): ListReturnState | null {
    if (!isBrowser()) return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const state = JSON.parse(raw) as ListReturnState;
        if (!state.path || typeof state.scrollY !== "number") return null;
        if (Date.now() - state.savedAt > MAX_AGE_MS) {
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
        if (!state.path.startsWith("/")) return null;
        return state;
    } catch {
        return null;
    }
}

export function consumeScrollRestore(): number | null {
    if (!isBrowser()) return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const state = JSON.parse(raw) as ListReturnState;
        if (Date.now() - state.savedAt > MAX_AGE_MS) return null;
        return typeof state.scrollY === "number" ? state.scrollY : null;
    } catch {
        return null;
    }
}

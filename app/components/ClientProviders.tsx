"use client";

import dynamic from "next/dynamic";
import { MobileNav } from "./MobileNav";

// Lazy load heavy interactive components - must be in a Client Component to use ssr: false
const SearchOverlay = dynamic(
    () => import("./search/SearchOverlay").then((mod) => mod.SearchOverlay),
    {
        ssr: false,
        loading: () => null,
    }
);

const AiConcierge = dynamic(
    () => import("./AiConcierge").then((mod) => mod.AiConcierge),
    {
        ssr: false,
        loading: () => null,
    }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <SearchOverlay />
            <AiConcierge />
            <MobileNav />
        </>
    );
}

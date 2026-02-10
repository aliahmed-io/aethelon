"use client";

import dynamic from "next/dynamic";
import { MobileNav } from "@/components/layout/MobileNav";

// Lazy load heavy interactive components - must be in a Client Component to use ssr: false
const SearchOverlay = dynamic(
    () => import("@/components/search/SearchOverlay").then((mod) => mod.SearchOverlay),
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
            <MobileNav />
        </>
    );
}


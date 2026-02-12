"use client";

import dynamic from "next/dynamic";

const CookieConsentBanner = dynamic(
    () => import("@/components/ui/CookieConsentBanner").then((mod) => mod.CookieConsentBanner),
    { ssr: false, loading: () => null }
);

/**
 * Client boundary for global CookieConsentBanner.
 * Isolates the `ssr: false` dynamic import so the root layout
 * remains a Server Component.
 */
export function CookieConsentProvider() {
    return <CookieConsentBanner />;
}

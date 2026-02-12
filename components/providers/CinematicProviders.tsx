"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(
    () => import("@/components/ui/CustomCursor"),
    { ssr: false, loading: () => null }
);
const AudioController = dynamic(
    () => import("@/components/features/AudioController"),
    { ssr: false, loading: () => null }
);
const Chatbot = dynamic(
    () => import("@/components/ui/Chatbot"),
    { ssr: false, loading: () => null }
);

/**
 * Client boundary for cinematic enhancement layer.
 * Wraps SSR-incompatible components (cursor, audio, chatbot)
 * so the parent layout can remain a Server Component.
 */
export function CinematicProviders() {
    return (
        <>
            <CustomCursor />
            <AudioController />
            <Chatbot />
        </>
    );
}

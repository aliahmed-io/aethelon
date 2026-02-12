"use client";

import dynamic from "next/dynamic";

const Chatbot = dynamic(
    () => import("@/components/ui/Chatbot"),
    { ssr: false, loading: () => null }
);

/**
 * Client boundary for AI-route Chatbot.
 * Isolates the `ssr: false` dynamic import behind a client boundary
 * so the (ai) layout can remain a Server Component.
 */
export function AIChatbotProvider() {
    return <Chatbot />;
}

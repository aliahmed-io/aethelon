"use client";

import dynamic from "next/dynamic";


const Chatbot = dynamic(
    () => import("@/components/ui/Chatbot"),
    { ssr: false, loading: () => null }
);

export function CinematicProviders() {
    return (
        <>
            <Chatbot />
        </>
    );
}

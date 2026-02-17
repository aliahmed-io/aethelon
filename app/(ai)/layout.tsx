import { ReactNode } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/layout/Footer";
import { AIChatbotProvider } from "@/components/providers/AIChatbotProvider";

/**
 * AI Tools layout — Navbar + Chatbot.
 * Used by AI Search, AI Vision, Atelier, Vault.
 * No cursor/scroll/audio enhancements.
 */
export default function AILayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <AIChatbotProvider />
            {children}
            <Footer />
        </>
    );
}

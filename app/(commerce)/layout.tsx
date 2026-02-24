import { ReactNode } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/layout/Footer";
import { isAdminUser } from "@/lib/auth";
import { AIChatbotProvider } from "@/components/providers/AIChatbotProvider";

/**
 * Commerce layout — lean, transactional.
 * No heavy cinematic visuals, but includes functional enhancements like chatbot.
 * Optimized for conversion-critical flows: shop, cart, checkout.
 */
export default function CommerceLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <AIChatbotProvider />
            <Footer />
        </>
    );
}

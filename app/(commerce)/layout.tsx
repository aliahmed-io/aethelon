import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Commerce layout — lean, transactional.
 * No cinematic enhancements (cursor, scroll, audio, chatbot).
 * Optimized for conversion-critical flows: shop, cart, checkout.
 */
export default function CommerceLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}

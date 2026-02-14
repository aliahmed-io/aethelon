import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { isAdminUser } from "@/lib/auth";

/**
 * Commerce layout — lean, transactional.
 * No cinematic enhancements (cursor, scroll, audio, chatbot).
 * Optimized for conversion-critical flows: shop, cart, checkout.
 */
export default async function CommerceLayout({ children }: { children: ReactNode }) {
    const isAdmin = await isAdminUser();

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            {children}
            <Footer />
        </>
    );
}

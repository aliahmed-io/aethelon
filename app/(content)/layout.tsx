import { ReactNode } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Content layout — static-first, lightweight.
 * Used by legal, FAQ, blog, contact, wholesale pages.
 * No client-side enhancements. Minimal JS footprint.
 */
export default function ContentLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}

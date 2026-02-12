import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SearchProvider } from "@/components/search/SearchContext";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { CookieConsentProvider } from "@/components/providers/CookieConsentProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://aethelon.vercel.app"),
    title: "Aethelon - Furniture for the Soul",
    description: "Award-winning premium furniture experience.",
};

/**
 * Root Layout — Commerce Shell only.
 *
 * Global concerns: fonts, CSS, search context, cookie consent.
 * Enhancement layer (cursor, scroll, audio, chatbot) is in route group layouts.
 * This keeps shared JS lean for transactional and content routes.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.variable} ${playfair.variable} bg-background text-foreground antialiased`}>
                <SearchProvider>
                    <ClientProviders>
                        {children}
                    </ClientProviders>
                    <CookieConsentProvider />
                </SearchProvider>
            </body>
        </html>
    );
}

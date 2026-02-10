import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/features/SmoothScroll";
import AudioController from "@/components/features/AudioController";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import { SearchProvider } from "@/components/search/SearchContext";
import { ClientProviders } from "@/components/providers/ClientProviders";
import CustomCursor from "@/components/ui/CustomCursor";
import Chatbot from "@/components/ui/Chatbot";

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
    title: "Aethelon - Furniture for the Soul",
    description: "Award-winning premium furniture experience.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.variable} ${playfair.variable} bg-background text-foreground antialiased`}>
                <SearchProvider>
                    <SmoothScroll>
                        <CustomCursor />
                        <Chatbot />
                        <AudioController />
                        <ClientProviders>
                            {children}
                        </ClientProviders>
                        <CookieConsentBanner />
                    </SmoothScroll>
                </SearchProvider>
            </body>
        </html>
    );
}

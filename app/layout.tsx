import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using generic google font for now as per plan
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import AudioController from "./components/AudioController";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { SearchProvider } from "./components/search/SearchContext";
import { ClientProviders } from "./components/ClientProviders";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap", // Optimization: Ensure text remains visible during font load
});

export const metadata: Metadata = {
    title: "Velorum Pilot's Watch Chronograph 41",
    description: "Swiss engineering. Scrollytelling experience.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} bg-[#050505] text-white antialiased`}>
                <SearchProvider>
                    <SmoothScroll>
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

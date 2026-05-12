import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SearchProvider } from "@/components/search/SearchContext";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { CookieConsentProvider } from "@/components/providers/CookieConsentProvider";
import SmoothScroll from "@/components/ui/SmoothScroll";

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

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://aethelon.com";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Aethelon — Furniture for the Soul",
        template: "%s | Aethelon",
    },
    description:
        "Aethelon crafts award-winning, sustainably sourced premium furniture. Discover pieces designed to transform your space into a sanctuary.",
    keywords: [
        "premium furniture",
        "luxury furniture",
        "sustainable furniture",
        "artisan furniture",
        "Aethelon",
        "home decor",
        "interior design",
    ],
    authors: [{ name: "Aethelon" }],
    creator: "Aethelon",
    publisher: "Aethelon",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: BASE_URL,
        siteName: "Aethelon",
        title: "Aethelon — Furniture for the Soul",
        description:
            "Award-winning premium furniture crafted to transform spaces into sanctuaries.",
        images: [
            {
                url: "/og-default.jpg",
                width: 1200,
                height: 630,
                alt: "Aethelon — Premium Furniture",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@aethelon",
        creator: "@aethelon",
        title: "Aethelon — Furniture for the Soul",
        description:
            "Award-winning premium furniture crafted to transform spaces into sanctuaries.",
        images: ["/og-default.jpg"],
    },
    manifest: "/manifest.json",
    icons: {
        icon: "/icon.png",
        apple: "/icon.png",
    },
    other: {
        "theme-color": "#2C2416",
    },
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
        <html lang="en">
            <body className={`${inter.variable} ${playfair.variable} bg-background text-foreground antialiased`}>
                {/* Skip to content — WCAG AA keyboard accessibility */}
                <a
                    href="#main-content"
                    className="skip-to-content"
                >
                    Skip to main content
                </a>
                <SmoothScroll>
                    <SearchProvider>
                        <ClientProviders>
                            {children}
                        </ClientProviders>
                        <CookieConsentProvider />
                    </SearchProvider>
                </SmoothScroll>
            </body>
        </html>
    );
}

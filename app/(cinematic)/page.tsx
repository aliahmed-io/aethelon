import type { Metadata } from "next";
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import LazyParticleCanvas from '@/components/landing/LazyParticleCanvas';
import ScrollManager from '@/components/landing/ScrollManager';
import NarrativeSections from '@/components/landing/NarrativeSections';
import { organizationSchema, websiteSchema } from "@/lib/structured-data";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://aethelon.com";

export const revalidate = 3600; // Generates a static HTML shell every 1 hour, bypassing DB wakeups for first users


export const metadata: Metadata = {
    title: "Aethelon — Furniture for the Soul",
    description:
        "Aethelon crafts award-winning, sustainably sourced premium furniture. Shop handcrafted pieces designed to transform your space into a sanctuary.",
    alternates: {
        canonical: BASE_URL,
    },
    openGraph: {
        title: "Aethelon — Furniture for the Soul",
        description:
            "Award-winning premium furniture crafted to transform spaces into sanctuaries.",
        url: BASE_URL,
        type: "website",
    },
    twitter: {
        title: "Aethelon — Furniture for the Soul",
        description:
            "Award-winning premium furniture crafted to transform spaces into sanctuaries.",
    },
};

export default function Home() {
    return (
        <main id="main-content" className="relative min-h-screen bg-background">
            <Navbar />

            {/* JSON-LD: Organisation + WebSite (sitelinks search box) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
            />

            {/* Visual Layer */}
            <LazyParticleCanvas />

            {/* Logic Layer */}
            <ScrollManager />

            {/* Content Layer */}
            <NarrativeSections />

            <Footer />
        </main>
    );
}


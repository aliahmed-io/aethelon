import { ReactNode } from "react";
import SmoothScroll from "@/components/features/SmoothScroll";
import { CinematicProviders } from "@/components/providers/CinematicProviders";

/**
 * Cinematic layout — full enhancement layer.
 *
 * Does NOT include Navbar/Footer because cinematic pages
 * use their own immersive navigation (e.g., landing page uses
 * ParticleCanvas with a custom Navbar variant).
 *
 * Each cinematic page is responsible for its own Navbar/Footer.
 */
export default function CinematicLayout({ children }: { children: ReactNode }) {
    return (
        <SmoothScroll>
            <CinematicProviders />
            {children}
        </SmoothScroll>
    );
}

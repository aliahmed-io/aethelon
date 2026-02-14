import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import LazyParticleCanvas from '@/components/landing/LazyParticleCanvas';
import ScrollManager from '@/components/landing/ScrollManager';
import NarrativeSections from '@/components/landing/NarrativeSections';
import { isAdminUser } from '@/lib/auth';

export default async function Home() {
    const isAdmin = await isAdminUser();

    return (
        <main className="relative min-h-screen bg-background">
            {/* Note: Landing uses UI Navbar which is different from Layout Navbar? NO. 
               Wait, components/ui/Navbar.tsx is NOT components/layout/Navbar.tsx.
               User pointed out "Navbar can no longer ever show admin UI" referring to components/layout/Navbar.tsx.
               But landing uses components/ui/Navbar.tsx!
               I should check if UI Navbar needs update too. 
               The file I viewed earlier was components/ui/Navbar.tsx and it had hardcoded logic?
               No, I viewed BOTH.
               components/layout/Navbar.tsx had: const isAdmin = false;
               components/ui/Navbar.tsx had: no admin check?
               Let's check components/ui/Navbar.tsx imports again.
               Ah, I see components/ui/Navbar.tsx in the imports of Home.
               I should double check which Navbar I edited.
               I edited components/layout/Navbar.tsx!
               The landing page uses `components/ui/Navbar`.
               So editing components/layout/Navbar.tsx affects CommerceLayout but NOT Landing Page if they use different navbars.
               I should check components/ui/Navbar.tsx again.
            */}
            <Navbar isAdmin={isAdmin} />

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

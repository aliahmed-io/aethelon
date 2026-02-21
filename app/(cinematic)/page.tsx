import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import LazyParticleCanvas from '@/components/landing/LazyParticleCanvas';
import ScrollManager from '@/components/landing/ScrollManager';
import NarrativeSections from '@/components/landing/NarrativeSections';
import { isAdminUser } from '@/lib/auth';

export default async function Home() {
    const isAdmin = await isAdminUser();

    return (
        <main className="relative min-h-screen bg-background">
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

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import LazyParticleCanvas from '@/components/landing/LazyParticleCanvas';
import ScrollManager from '@/components/landing/ScrollManager';
import NarrativeSections from '@/components/landing/NarrativeSections';

export default function Home() {
    return (
        <main className="relative min-h-screen bg-background">
            <Navbar />

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

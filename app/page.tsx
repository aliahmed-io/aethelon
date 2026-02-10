import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ParticleCanvas from '@/components/landing/ParticleCanvas';
import ScrollManager from '@/components/landing/ScrollManager';
import NarrativeSections from '@/components/landing/NarrativeSections';

export default function Home() {
    return (
        <main className="relative min-h-screen bg-background">
            <Navbar />

            {/* Visual Layer */}
            <ParticleCanvas />

            {/* Logic Layer */}
            <ScrollManager />

            {/* Content Layer */}
            <NarrativeSections />

            <Footer />
        </main>
    );
}

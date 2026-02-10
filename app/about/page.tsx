
import { Navbar } from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";


export const metadata = {
    title: "About Us | Velorum",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
                {/* Hero */}
                <div className="mb-24 text-center">
                    <h1 className="text-4xl lg:text-6xl font-light tracking-tighter uppercase mb-6">
                        Probus Scafusia
                    </h1>
                    <p className="text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
                        Solid. Precise. Engineered for men who fly.
                    </p>
                </div>

                {/* Content Section 1 */}
                <div className="grid lg:grid-cols-2 gap-16 mb-32 items-center">
                    <div className="relative aspect-square">
                        <div className="absolute inset-0 bg-white/5 rounded-sm overflow-hidden border border-white/10">
                            {/* Placeholder for About Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">
                                [Engineering Image]
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-light uppercase tracking-tight mb-6">The Engineer&apos;s Spirit</h2>
                        <div className="w-12 h-1 bg-white mb-8"></div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            Velorum was founded on a simple premise: instruments for professionals. We don&apos;t just make watches; we create redundant systems for aerial navigation.
                            Our timepieces are designed to withstand the G-forces of modern jet combat and the magnetic fields of electronic cockpits.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Every component is machined to micron-level tolerance in our Schaffhausen manufacture, ensuring that when you&apos;re at 30,000 feet, your time is absolute.
                        </p>
                    </div>
                </div>

                {/* Content Section 2 (Reversed) */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl font-light uppercase tracking-tight mb-6">Sustainable Aviation</h2>
                        <div className="w-12 h-1 bg-white mb-8"></div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            We believe the sky belongs to everyone. That&apos;s why Velorum is pioneering the use of Ceratanium® and recycled aerospace-grade titanium.
                            Our manufacturing facility operates on 100% renewable hydroelectric power from the Rhine Falls.
                        </p>
                    </div>
                    <div className="relative aspect-square order-1 lg:order-2">
                        <div className="absolute inset-0 bg-white/5 rounded-sm overflow-hidden border border-white/10">
                            {/* Placeholder for Factory Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">
                                [Manufacture Image]
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-32">
                <Footer />
            </div>
        </main>
    );
}

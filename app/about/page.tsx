
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export const metadata = {
    title: "About Us | Aethelon",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
                {/* Hero */}
                <div className="mb-24 text-center">
                    <h1 className="text-4xl lg:text-6xl font-light tracking-tighter uppercase mb-6">
                        Probus Scafusia
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                        Solid. Precise. Engineered for men who fly.
                    </p>
                </div>

                {/* Content Section 1 */}
                <div className="grid lg:grid-cols-2 gap-16 mb-32 items-center">
                    <div className="relative aspect-square">
                        <div className="absolute inset-0 bg-muted rounded-sm overflow-hidden border border-border">
                            {/* Placeholder for About Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                                [Engineering Image]
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-light uppercase tracking-tight mb-6">The Engineer&apos;s Spirit</h2>
                        <div className="w-12 h-1 bg-accent mb-8"></div>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Aethelon was founded on a simple premise: instruments for professionals. We don&apos;t just make watches; we create redundant systems for aerial navigation.
                            Our timepieces are designed to withstand the G-forces of modern jet combat and the magnetic fields of electronic cockpits.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Every component is machined to micron-level tolerance in our Schaffhausen manufacture, ensuring that when you&apos;re at 30,000 feet, your time is absolute.
                        </p>
                    </div>
                </div>

                {/* Content Section 2 (Reversed) */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl font-light uppercase tracking-tight mb-6">Sustainable Aviation</h2>
                        <div className="w-12 h-1 bg-accent mb-8"></div>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            We believe the sky belongs to everyone. That&apos;s why Aethelon is pioneering the use of Ceratanium® and recycled aerospace-grade titanium.
                            Our manufacturing facility operates on 100% renewable hydroelectric power from the Rhine Falls.
                        </p>
                    </div>
                    <div className="relative aspect-square order-1 lg:order-2">
                        <div className="absolute inset-0 bg-muted rounded-sm overflow-hidden border border-border">
                            {/* Placeholder for Factory Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
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

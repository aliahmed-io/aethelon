
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
                        Crafted to Endure
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                        Designing furniture that transforms spaces into sanctuaries.
                    </p>
                </div>

                {/* Content Section 1 */}
                <div className="grid lg:grid-cols-2 gap-16 mb-32 items-center">
                    <div className="relative aspect-square">
                        <div className="absolute inset-0 bg-muted rounded-sm overflow-hidden border border-border">
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                                [Workshop Image]
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-light uppercase tracking-tight mb-6">The Maker&apos;s Spirit</h2>
                        <div className="w-12 h-1 bg-accent mb-8"></div>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Aethelon was founded on a simple premise: furniture should be an experience.
                            We don&apos;t just build pieces; we design environments. Every joint, every curve,
                            every grain pattern is intentional — selected to bring warmth, beauty, and permanence
                            to the spaces you call home.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Our artisans work with responsibly sourced hardwoods, premium leathers, and hand-finished
                            metals, ensuring that every piece is built to last generations — not seasons.
                        </p>
                    </div>
                </div>

                {/* Content Section 2 (Reversed) */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl font-light uppercase tracking-tight mb-6">Sustainable by Design</h2>
                        <div className="w-12 h-1 bg-accent mb-8"></div>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            We believe luxury and responsibility can coexist. That&apos;s why Aethelon pioneers
                            the use of reclaimed timbers, water-based finishes, and carbon-neutral logistics.
                            Our Geneva atelier operates on 100% renewable energy.
                        </p>
                    </div>
                    <div className="relative aspect-square order-1 lg:order-2">
                        <div className="absolute inset-0 bg-muted rounded-sm overflow-hidden border border-border">
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                                [Atelier Image]
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

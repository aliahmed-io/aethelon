import { Sparkles, Box } from "lucide-react";
import { PremiumVaultCard } from "@/components/storefront/PremiumVaultCard";
import type { VisualizerProduct } from "@/components/visualizer/types";

interface VaultLandingProps {
    products: VisualizerProduct[];
}

export function VaultLanding({ products }: VaultLandingProps) {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 lg:p-10 flex items-center justify-between z-20 mix-blend-difference">
                <div className="flex items-center gap-3 text-white/80">
                    <Box className="w-5 h-5" />
                    <span className="font-mono text-xs uppercase tracking-[0.2em]">The Vault</span>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-12 flex flex-col items-center justify-center text-center max-w-4xl mx-auto z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
                        Exclusive Collection
                    </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight">
                    Exceptional Design, <br />
                    <span className="text-white/40 italic">In Every Dimension.</span>
                </h1>

                <p className="text-white/50 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                    A highly curated selection of our most premium, one-of-a-kind pieces.
                    Explore the collection in interactive 3D and augmented reality before inquiring with our concierge.
                </p>
            </section>

            {/* Vault Grid */}
            <section className="px-6 lg:px-12 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10">
                    {products.map((product) => (
                        <PremiumVaultCard
                            key={product.id}
                            product={product}
                            href={`/ai-vision?product=${product.id}`}
                        />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="py-24 text-center border border-white/10 bg-white/5 rounded-md">
                        <p className="text-white/50 font-mono uppercase tracking-widest text-sm">
                            The Vault is currently empty.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

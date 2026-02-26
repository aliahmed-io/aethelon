import { Sparkles, Box, View } from "lucide-react";
import type { VisualizerProduct } from "@/components/visualizer/types";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface TryOnLandingProps {
    products: VisualizerProduct[];
}

export function TryOnLanding({ products }: TryOnLandingProps) {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-accent/30">
            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 lg:p-10 flex items-center justify-between z-20">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <View className="w-5 h-5" />
                    <span className="font-mono text-xs uppercase tracking-[0.2em]">Try-On</span>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-12 flex flex-col items-center justify-center text-center max-w-4xl mx-auto z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 mb-8">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Augmented Reality & Room Visualizer
                    </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight">
                    See It In Your Space <br />
                    <span className="text-muted-foreground italic">Before You Buy.</span>
                </h1>

                <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                    Select a product from our catalog to instantly visualize its precise scale, lighting, and placement in your living room through immersive AR and 3D.
                </p>
            </section>

            {/* Try-On Grid */}
            <section className="px-6 lg:px-12 pb-32 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/ar?id=${product.id}`}
                            className="group relative flex flex-col items-center justify-between bg-muted/20 border border-border rounded-lg p-6 hover:border-accent transition-colors"
                        >
                            <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-md">
                                <Image
                                    src={product.images[0] || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                            </div>
                            <div className="w-full text-center">
                                <h3 className="font-display tracking-tight text-lg mb-1">{product.name}</h3>
                                <p className="text-accent font-medium mb-4">{formatPrice(product.price / 100)}</p>
                                <div className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors rounded-sm text-xs font-bold uppercase tracking-widest">
                                    <View className="w-4 h-4" />
                                    Try On
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="py-24 text-center border border-border bg-muted/20 rounded-md">
                        <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">
                            No 3D models available.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

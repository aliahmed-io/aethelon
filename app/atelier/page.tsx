"use client";

import { Navbar } from "@/components/layout/Navbar";
import { TryOnForm } from "./TryOnForm";
import { HistoryPanel } from "./HistoryPanel";

export default function AtelierPage() {
    return (
        <div className="bg-background min-h-screen text-foreground pt-32 pb-20 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row gap-16">
                    {/* Left Column: The Experience */}
                    <div className="md:w-2/3">
                        <div className="mb-12">
                            <span className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Beta Access</span>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6">
                                VIRTUAL <br /> ATELIER
                            </h1>
                            <p className="text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
                                Experience our timepieces on your wrist using advanced generative AI.
                                Upload a photo and let our digital artisan render the perfect fit.
                            </p>
                        </div>

                        <div className="bg-muted/50 border border-border rounded-sm p-1 backdrop-blur-md">
                            <TryOnForm />
                        </div>
                    </div>

                    {/* Right Column: History/Gallery */}
                    <div className="md:w-1/3">
                        <div className="sticky top-32">
                            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-muted-foreground pb-4 border-b border-border">
                                Your Session
                            </h3>
                            <HistoryPanel />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

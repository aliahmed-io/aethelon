"use client";

import { Navbar } from "@/app/components/Navbar";
import { TryOnForm } from "./TryOnForm";
import { HistoryPanel } from "./HistoryPanel";

export default function AtelierPage() {
    return (
        <div className="bg-[#050505] min-h-screen text-white pt-32 pb-20 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-zinc-500/10 blur-[120px] rounded-full pointer-events-none" />

            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row gap-16">
                    {/* Left Column: The Experience */}
                    <div className="md:w-2/3">
                        <div className="mb-12">
                            <span className="text-zinc-400/80 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Beta Access</span>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6">
                                VIRTUAL <br /> ATELIER
                            </h1>
                            <p className="text-white/40 max-w-lg text-lg font-light leading-relaxed">
                                Experience our timepieces on your wrist using advanced generative AI.
                                Upload a photo and let our digital artisan render the perfect fit.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-sm p-1 backdrop-blur-md">
                            <TryOnForm />
                        </div>
                    </div>

                    {/* Right Column: History/Gallery */}
                    <div className="md:w-1/3">
                        <div className="sticky top-32">
                            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-white/50 pb-4 border-b border-white/10">
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

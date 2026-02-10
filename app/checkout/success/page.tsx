"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function CheckoutSuccessPage() {
    return (
        <div className="bg-background min-h-screen text-foreground flex flex-col items-center justify-center relative overflow-hidden">
            {/* Warm Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-[150px] animate-pulse pointer-events-none" />

            <Navbar />

            <div className="relative z-10 text-center max-w-lg mx-auto px-6">
                <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center relative z-10">
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center animate-[scaleIn_0.5s_ease-out]">
                            <Check className="w-8 h-8 text-accent-foreground" />
                        </div>
                    </div>
                    {/* Ring Pulse */}
                    <div className="absolute inset-0 rounded-full border border-accent/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                </div>

                <span className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Acquisition Complete</span>
                <h1 className="text-4xl md:text-5xl font-light tracking-tighter mb-6">
                    WELCOME TO THE CLUB.
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed mb-10">
                    Your order has been confirmed. You will receive a bespoke tracking dossier via email shortly.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link href="/dashboard" className="w-full md:w-auto px-8 py-3 bg-muted border border-border hover:bg-accent/10 transition-colors text-xs font-bold uppercase tracking-widest rounded-sm">
                        View Order Status
                    </Link>
                    <Link href="/shop" className="w-full md:w-auto px-8 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-xs font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2">
                        Continue Browsing
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

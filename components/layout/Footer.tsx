
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="relative z-10 bg-[#050505] text-white py-24 px-6 md:px-12 border-t border-white/10 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-20 relative z-10">
                {/* Brand & Mission */}
                <div className="space-y-8 max-w-sm">
                    <h2 className="text-3xl font-bold tracking-tighter uppercase relative inline-block">
                        Aethelon Geneve
                        <span className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed">
                        Probus Scafusia. Engineered for the modern aviator.
                        Merging Swiss heritage with quantum-era interfaces to create the ultimate pilot&apos;s chronograph.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Icons Placeholder - Could be actual icons */}
                        <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer">
                            <span className="text-xs font-bold">IG</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer">
                            <span className="text-xs font-bold">X</span>
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="flex-1 w-full lg:w-auto max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">The Aethelon Chronicle</h3>
                    <p className="text-xs text-white/40 mb-6">Join 12,000+ aviators receiving weekly flight logs and exclusive drops.</p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="pilot@aethelon.ch"
                            className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/20 h-10 text-xs"
                        />
                        <Button size="icon" className="h-10 w-10 bg-white text-black hover:bg-white/90">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Links */}
                <div className="flex gap-16 text-sm font-medium text-white/60">
                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold uppercase tracking-widest text-xs mb-2">Collection</span>
                        <Link href="/shop?category=PILOT" className="hover:text-white transition-colors">Pilot&apos;s Watches</Link>
                        <Link href="/shop?category=PORTUGIESER" className="hover:text-white transition-colors">Portugieser</Link>
                        <Link href="/shop?category=PORTOFINO" className="hover:text-white transition-colors">Portofino</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold uppercase tracking-widest text-xs mb-2">Legal</span>
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/legal/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-white/20 gap-4">
                <span>© 2026 Aethelon SA. Schaffhausen, Switzerland.</span>
                <span className="font-mono tracking-widest">EST. 1868 // REBORN 2026</span>
            </div>
        </footer>
    );
}

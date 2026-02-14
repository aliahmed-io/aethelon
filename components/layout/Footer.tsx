
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CurrencySwitcher } from "@/components/store/CurrencySwitcher";
import { CurrencyService } from "@/modules/currency/currency.service";

export default async function Footer() {
    const currentCurrency = await CurrencyService.getCurrency();

    return (
        <footer className="relative z-10 bg-secondary text-foreground py-24 px-6 md:px-12 border-t border-border overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-20 relative z-10">
                {/* Brand & Mission */}
                <div className="space-y-8 max-w-sm">
                    <h2 className="text-3xl font-bold tracking-tighter uppercase relative inline-block">
                        Aethelon Geneve
                        <span className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Crafting sanctuaries for the modern soul. Sustainable luxury furniture
                        born from heritage craftsmanship and forward-thinking design.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Icons */}
                        <div className="w-8 h-8 rounded-full bg-muted hover:bg-accent text-foreground hover:text-accent-foreground flex items-center justify-center transition-all cursor-pointer">
                            <span className="text-xs font-bold">IG</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted hover:bg-accent text-foreground hover:text-accent-foreground flex items-center justify-center transition-all cursor-pointer">
                            <span className="text-xs font-bold">X</span>
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="flex-1 w-full lg:w-auto max-w-md bg-muted/50 backdrop-blur-md border border-border p-8 rounded-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">The Aethelon Chronicle</h3>
                    <p className="text-xs text-muted-foreground mb-6">Join 12,000+ design enthusiasts receiving weekly updates and exclusive drops.</p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="your@email.com"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-accent/30 h-10 text-xs"
                        />
                        <Button size="icon" className="h-10 w-10 bg-accent text-accent-foreground hover:bg-accent/90">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Links */}
                <div className="flex gap-16 text-sm font-medium text-muted-foreground">
                    <div className="flex flex-col gap-4">
                        <span className="text-foreground font-bold uppercase tracking-widest text-xs mb-2">Explore</span>
                        <Link href="/shop" className="hover:text-foreground transition-colors">Collection</Link>
                        <Link href="/about" className="hover:text-foreground transition-colors">Our Story</Link>
                        <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                        <Link href="/wholesale" className="hover:text-foreground transition-colors">Wholesale</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-foreground font-bold uppercase tracking-widest text-xs mb-2">Legal</span>
                        <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/legal/shipping" className="hover:text-foreground transition-colors">Shipping</Link>
                        <Link href="/legal/returns" className="hover:text-foreground transition-colors">Returns</Link>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground/50 gap-4">
                <span className="flex items-center gap-4">
                    © 2026 Aethelon SA. Geneva, Switzerland.
                    <CurrencySwitcher currentCurrency={currentCurrency} />
                </span>
                <span className="font-mono tracking-widest">DESIGNED WITH PURPOSE // EST. 2026</span>
            </div>
        </footer>
    );
}

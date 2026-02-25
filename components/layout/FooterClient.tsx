"use client";

import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CurrencySwitcher } from "@/components/store/CurrencySwitcher";
import type { CurrencyCode } from "@/modules/currency/currency.service";

interface FooterClientProps {
    currentCurrency: CurrencyCode;
}

export function FooterClient({ currentCurrency }: FooterClientProps) {
    const pathname = usePathname();
    const isVault = pathname.startsWith("/vault");

    /* ── Vault palette (mirrors .vault CSS vars) ── */
    const V = {
        bg: "#131009",
        surface: "#1C1510",
        border: "#57412A",
        fg: "#EDE0CC",
        muted: "#9A7A5C",
        gold: "#AB7E22",
    } as const;

    if (isVault) {
        return (
            <footer
                className="relative z-10 py-20 px-6 md:px-12 overflow-hidden"
                style={{ background: V.bg, borderTop: `1px solid ${V.border}`, color: V.fg }}
            >
                {/* Ambient glow */}
                <div
                    className="absolute top-0 left-1/4 w-[400px] h-[400px] blur-[100px] rounded-full pointer-events-none -translate-y-1/2"
                    style={{ background: `${V.gold}08` }}
                />

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 relative z-10">
                    {/* Brand */}
                    <div className="space-y-6 max-w-sm">
                        <h2 className="text-2xl font-light tracking-[0.2em] uppercase" style={{ color: V.fg }}>
                            Aethelon Geneve
                        </h2>
                        <p className="text-sm leading-relaxed font-light" style={{ color: V.muted }}>
                            Crafting sanctuaries for the modern soul. Sustainable luxury
                            furniture born from heritage craftsmanship.
                        </p>
                        <div className="flex gap-3">
                            {["IG", "X"].map((s) => (
                                <div
                                    key={s}
                                    className="w-8 h-8 rounded-sm flex items-center justify-center transition-colors cursor-pointer text-xs font-mono"
                                    style={{ border: `1px solid ${V.border}`, color: V.muted }}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div
                        className="flex-1 w-full lg:w-auto max-w-sm p-8"
                        style={{ border: `1px solid ${V.border}`, background: V.surface }}
                    >
                        <h3 className="text-xs font-mono uppercase tracking-[0.25em] mb-2" style={{ color: V.gold }}>
                            The Aethelon Chronicle
                        </h3>
                        <p className="text-xs mb-5 font-light" style={{ color: V.muted }}>
                            Weekly updates and exclusive Vault drops.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="your@email.com"
                                className="h-9 text-xs rounded-none border-0 focus-visible:ring-1"
                                style={{
                                    background: "#0E0B08",
                                    color: V.fg,
                                    outline: `1px solid ${V.border}`,
                                }}
                            />
                            <Button
                                size="icon"
                                className="h-9 w-9 rounded-none border-0"
                                style={{ background: V.gold, color: V.bg }}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex gap-12 text-sm font-light" style={{ color: V.muted }}>
                        {[
                            {
                                title: "Explore",
                                links: [
                                    { href: "/shop", label: "Collection" },
                                    { href: "/vault", label: "The Vault" },
                                    { href: "/campaigns", label: "Campaigns" },
                                    { href: "/ai-search", label: "AI Search" },
                                    { href: "/blog", label: "Journal" },
                                    { href: "/contact", label: "Contact" },
                                ],
                            },
                            {
                                title: "Legal",
                                links: [
                                    { href: "/legal/privacy", label: "Privacy" },
                                    { href: "/legal/terms", label: "Terms" },
                                    { href: "/legal/shipping", label: "Shipping" },
                                    { href: "/legal/returns", label: "Returns" },
                                ],
                            },
                        ].map((col) => (
                            <div key={col.title} className="flex flex-col gap-3">
                                <span className="text-[10px] font-mono uppercase tracking-[0.25em] mb-1" style={{ color: V.gold }}>
                                    {col.title}
                                </span>
                                {col.links.map((l) => (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        className="transition-colors duration-200 hover:opacity-80 text-sm"
                                        style={{ color: V.muted }}
                                    >
                                        {l.label}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    className="max-w-7xl mx-auto mt-16 pt-6 flex flex-col md:flex-row justify-between items-center text-xs gap-4"
                    style={{ borderTop: `1px solid ${V.border}`, color: V.muted }}
                >
                    <span className="flex items-center gap-4 font-mono">
                        © 2026 Aethelon SA. Geneva, Switzerland.
                        <CurrencySwitcher currentCurrency={currentCurrency} />
                    </span>
                    <span className="font-mono tracking-widest opacity-50">
                        DESIGNED WITH PURPOSE // EST. 2026
                    </span>
                </div>
            </footer>
        );
    }

    /* ── Standard light footer ─────────────────────────────── */
    return (
        <footer className="relative z-10 bg-secondary text-foreground py-24 px-6 md:px-12 border-t border-border overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-20 relative z-10">
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
                        {["IG", "X"].map((s) => (
                            <div
                                key={s}
                                className="w-8 h-8 rounded-full bg-muted hover:bg-accent text-foreground hover:text-accent-foreground flex items-center justify-center transition-all cursor-pointer"
                            >
                                <span className="text-xs font-bold">{s}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full lg:w-auto max-w-md bg-muted/50 backdrop-blur-md border border-border p-8 rounded-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">The Aethelon Chronicle</h3>
                    <p className="text-xs text-muted-foreground mb-6">Join 12,000+ design enthusiasts receiving weekly updates and exclusive drops.</p>
                    <div className="flex gap-2">
                        <Input placeholder="your@email.com" className="bg-background border-border text-foreground placeholder:text-muted-foreground/40 h-10 text-xs" />
                        <Button size="icon" className="h-10 w-10 bg-accent text-accent-foreground hover:bg-accent/90">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex gap-16 text-sm font-medium text-muted-foreground">
                    <div className="flex flex-col gap-4">
                        <span className="text-foreground font-bold uppercase tracking-widest text-xs mb-2">Explore</span>
                        {[
                            ["/shop", "Collection"], ["/about", "Our Story"], ["/atelier", "AI Try-On"],
                            ["/blog", "Blog"], ["/faq", "FAQ"], ["/contact", "Contact"], ["/wholesale", "Wholesale"],
                        ].map(([href, label]) => (
                            <Link key={href} href={href} className="hover:text-foreground transition-colors">{label}</Link>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-foreground font-bold uppercase tracking-widest text-xs mb-2">Legal</span>
                        {[
                            ["/legal/privacy", "Privacy"], ["/legal/terms", "Terms"], ["/legal/cookies", "Cookies"],
                            ["/legal/shipping", "Shipping"], ["/legal/returns", "Returns"],
                        ].map(([href, label]) => (
                            <Link key={href} href={href} className="hover:text-foreground transition-colors">{label}</Link>
                        ))}
                    </div>
                </div>
            </div>

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

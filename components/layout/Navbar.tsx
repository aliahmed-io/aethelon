"use client";

import Link from "next/link";
import clsx from "clsx";
import { Search, ShoppingBag, User, ArrowRight } from "lucide-react";
import { useSearch } from "@/components/search/SearchContext";
import { useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { UserDropdown } from "@/components/storefront/UserDropdown";

interface NavbarProps {
    progress?: number;
}

export function Navbar({ progress }: NavbarProps) {
    const { openSearch } = useSearch();
    const { user, isAuthenticated } = useKindeBrowserClient();

    // Admin Check Logic (Matches layout logic)
    const isAdmin = user?.email === "alihassan182006@gmail.com" || user?.email?.endsWith("@aethelon.geneve.com");

    const isLanding = typeof progress !== 'undefined';
    const isVisible = isLanding ? progress > 0.02 : true;

    const opacity = isLanding ? Math.min((progress - 0.02) * 10, 1) : 1;
    const blur = isLanding ? Math.min((progress - 0.02) * 200, 12) : 12;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <nav
                className={clsx(
                    "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-6 transition-all duration-700",
                    !isVisible && "opacity-0 -translate-y-4",
                    isVisible && "opacity-100 translate-y-0"
                )}
                style={{
                    backgroundColor: isMenuOpen ? 'transparent' : `rgba(250, 249, 245, ${opacity * 0.9})`,
                    backdropFilter: isMenuOpen ? 'none' : `blur(${blur}px)`,
                    WebkitBackdropFilter: isMenuOpen ? 'none' : `blur(${blur}px)`,
                    borderBottom: opacity > 0.5 ? '1px solid rgba(44, 36, 22, 0.08)' : 'none',
                }}
            >
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-foreground font-bold tracking-tighter text-lg uppercase cursor-pointer relative z-50">
                        AETHELON GENEVE
                    </Link>
                    <div className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Link href="/campaigns" className="hover:text-foreground cursor-pointer transition-colors pt-0.5">Campaigns</Link>
                        <Link href="/shop" className="hover:text-foreground cursor-pointer transition-colors pt-0.5">Collection</Link>
                        <Link href="/atelier" className="hover:text-foreground cursor-pointer transition-colors pt-0.5">Virtual Atelier</Link>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={openSearch} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors relative z-50" data-testid="search-button">
                        <Search className="w-5 h-5" />
                        <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">Concierge</span>
                    </button>

                    {/* Auth / Account Dropdown */}
                    <div className="hidden md:block relative z-50">
                        {isAuthenticated && user ? (
                            <UserDropdown
                                email={user.email || ""}
                                name={`${user.given_name} ${user.family_name}`}
                                userImage={user.picture || ""}
                                isAdmin={isAdmin}
                            />
                        ) : (
                            <LoginLink className="text-muted-foreground hover:text-foreground transition-colors">
                                <User className="w-5 h-5" />
                            </LoginLink>
                        )}
                    </div>

                    <Link href="/bag" className="text-muted-foreground hover:text-foreground transition-colors relative hidden md:block z-50">
                        <ShoppingBag className="w-5 h-5" />
                    </Link>

                    <Link href="/vault" className="px-6 py-2 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all rounded-sm hidden sm:block z-50">
                        Vault
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-muted-foreground hover:text-foreground transition-colors relative z-50"
                    >
                        <div className="space-y-1.5">
                            <span className={clsx("block w-6 h-0.5 bg-current transition-transform duration-300", isMenuOpen && "rotate-45 translate-y-2")} />
                            <span className={clsx("block w-6 h-0.5 bg-current transition-opacity duration-300", isMenuOpen && "opacity-0")} />
                            <span className={clsx("block w-6 h-0.5 bg-current transition-transform duration-300", isMenuOpen && "-rotate-45 -translate-y-2")} />
                        </div>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={clsx(
                "fixed inset-0 z-40 bg-background transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
                isMenuOpen ? "translate-y-0" : "-translate-y-full"
            )}>
                <div className="h-full flex flex-col justify-center px-8">
                    <div className="space-y-8 flex flex-col">
                        {[
                            { href: '/campaigns', label: 'Campaigns' },
                            { href: '/shop', label: 'Collection' },
                            { href: '/atelier', label: 'Virtual Atelier' },
                            { href: '/vault', label: 'Vault' },
                            { href: isAdmin ? '/dashboard' : '/account', label: isAdmin ? 'Admin Dashboard' : 'My Account' },
                        ].map((link, idx) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={clsx(
                                    "text-4xl font-light tracking-tighter text-foreground/90 hover:text-accent hover:pl-4 transition-all duration-300 transform translate-y-8 opacity-0",
                                    isMenuOpen && "animate-[slideUpFade_0.5s_forwards]"
                                )}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 pt-12 border-t border-border grid grid-cols-2 gap-4 text-xs uppercase tracking-widest text-muted-foreground">
                        <Link href="/legal/contact" className="hover:text-foreground">Contact Concierge</Link>
                        <Link href="/legal/shipping" className="hover:text-foreground">Shipping & Returns</Link>
                        {!isAuthenticated && (
                            <LoginLink className="hover:text-foreground flex items-center gap-2">Sign In <ArrowRight className="w-3 h-3" /></LoginLink>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

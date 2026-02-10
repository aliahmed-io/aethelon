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
                    backgroundColor: isMenuOpen ? 'transparent' : `rgba(5, 5, 5, ${opacity * 0.8})`,
                    backdropFilter: isMenuOpen ? 'none' : `blur(${blur}px)`,
                    WebkitBackdropFilter: isMenuOpen ? 'none' : `blur(${blur}px)`,
                }}
            >
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-white font-bold tracking-tighter text-lg uppercase cursor-pointer relative z-50">
                        AETHELON GENEVE
                    </Link>
                    <div className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-widest text-white/50">
                        <Link href="/campaigns" className="hover:text-white cursor-pointer transition-colors pt-0.5">Campaigns</Link>
                        <Link href="/shop" className="hover:text-white cursor-pointer transition-colors pt-0.5">Collection</Link>
                        <Link href="/atelier" className="hover:text-white cursor-pointer transition-colors pt-0.5">Virtual Atelier</Link>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={openSearch} className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors relative z-50" data-testid="search-button">
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
                            <LoginLink className="text-white/70 hover:text-white transition-colors">
                                <User className="w-5 h-5" />
                            </LoginLink>
                        )}
                    </div>

                    <Link href="/bag" className="text-white/70 hover:text-white transition-colors relative hidden md:block z-50">
                        <ShoppingBag className="w-5 h-5" />
                    </Link>

                    <Link href="/vault" className="px-6 py-2 border border-white/20 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm hidden sm:block z-50">
                        Vault
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-white/70 hover:text-white transition-colors relative z-50"
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
                "fixed inset-0 z-40 bg-[#050505] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
                isMenuOpen ? "translate-y-0" : "-translate-y-full"
            )}>
                <div className="h-full flex flex-col justify-center px-8">
                    <div className="space-y-8 flex flex-col">
                        {[
                            { href: '/campaigns', label: 'Campaigns' },
                            { href: '/shop', label: 'Collection' },
                            { href: '/atelier', label: 'Virtual Atelier' },
                            { href: '/vault', label: 'Vault' },
                            // Dashboard link in mobile menu handled dynamically? For now keep static link or update
                            { href: isAdmin ? '/dashboard' : '/account', label: isAdmin ? 'Admin Dashboard' : 'My Account' },
                        ].map((link, idx) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={clsx(
                                    "text-4xl font-light tracking-tighter text-white/90 hover:text-white hover:pl-4 transition-all duration-300 transform translate-y-8 opacity-0",
                                    isMenuOpen && "animate-[slideUpFade_0.5s_forwards]"
                                )}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 pt-12 border-t border-white/10 grid grid-cols-2 gap-4 text-xs uppercase tracking-widest text-white/40">
                        <Link href="/legal/contact" className="hover:text-white">Contact Concierge</Link>
                        <Link href="/legal/shipping" className="hover:text-white">Shipping & Returns</Link>
                        {!isAuthenticated && (
                            <LoginLink className="hover:text-white flex items-center gap-2">Sign In <ArrowRight className="w-3 h-3" /></LoginLink>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Keeping CSS animation simple for the slide up effect
// const styles = `
// @keyframes slideUpFade {
//    to {
//        transform: translateY(0);
//        opacity: 1;
//    }
// }
// `;


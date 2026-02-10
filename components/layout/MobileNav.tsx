"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useSearch } from "@/components/search/SearchContext";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import clsx from "clsx";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { action: "search", icon: Search, label: "Search" },
    { href: "/bag", icon: ShoppingBag, label: "Bag" },
    { href: "/account", icon: User, label: "Account" },
];

export function MobileNav() {
    const pathname = usePathname();
    const { openSearch } = useSearch();
    const { isAuthenticated } = useKindeBrowserClient();

    // Don't show on dashboard pages
    if (pathname?.startsWith("/dashboard")) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 safe-area-pb">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = item.href === pathname;
                    const Icon = item.icon;

                    if (item.action === "search") {
                        return (
                            <button
                                key="search"
                                onClick={openSearch}
                                className="flex flex-col items-center justify-center gap-1 w-16 h-full text-white/50 hover:text-white transition-colors"
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[9px] uppercase tracking-widest">{item.label}</span>
                            </button>
                        );
                    }

                    // Handle account link based on auth
                    const href = item.href === "/account" && !isAuthenticated ? "/api/auth/login" : item.href;

                    return (
                        <Link
                            key={item.href}
                            href={href!}
                            className={clsx(
                                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                                isActive ? "text-white" : "text-white/50 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[9px] uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

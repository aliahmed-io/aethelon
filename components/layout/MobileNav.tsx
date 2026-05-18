"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, Store } from "lucide-react";
import { useSearch } from "@/components/search/SearchContext";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import clsx from "clsx";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { DEMO_MESSAGES } from "@/lib/demo-messages";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shop", icon: Store, label: "Shop" },
    { action: "search", icon: Search, label: "Search" },
    { href: "/bag", icon: ShoppingBag, label: "Bag" },
    { href: "/account", icon: User, label: "Account" },
] as const;

function isCommerceRoute(pathname: string) {
    return (
        pathname === "/shop" ||
        pathname.startsWith("/shop/") ||
        pathname.startsWith("/categories") ||
        pathname === "/bag" ||
        pathname.startsWith("/checkout")
    );
}

export function MobileNav() {
    const pathname = usePathname();
    const { openSearch } = useSearch();
    const { isAuthenticated } = useKindeBrowserClient();
    const { showDemoNotice } = useAuthPrompt();

    if (!pathname || pathname.startsWith("/dashboard") || pathname === "/ar" || pathname.startsWith("/ar/")) {
        return null;
    }

    const commerceTheme = isCommerceRoute(pathname);

    return (
        <nav
            className={clsx(
                "fixed bottom-0 left-0 right-0 z-50 lg:hidden backdrop-blur-xl border-t safe-area-pb",
                commerceTheme
                    ? "bg-background/95 border-border"
                    : "bg-black/90 border-white/10"
            )}
        >
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const inactiveClass = commerceTheme ? "text-muted-foreground hover:text-foreground" : "text-white/50 hover:text-white";
                    const activeClass = commerceTheme ? "text-foreground" : "text-white";

                    if ("action" in item && item.action === "search") {
                        return (
                            <button
                                key="search"
                                type="button"
                                onClick={openSearch}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                                    inactiveClass
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[9px] uppercase tracking-widest">{item.label}</span>
                            </button>
                        );
                    }

                    if ("href" in item && item.href === "/account" && !isAuthenticated) {
                        return (
                            <button
                                key="account-trigger"
                                type="button"
                                onClick={() => showDemoNotice(DEMO_MESSAGES.auth)}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                                    inactiveClass
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[9px] uppercase tracking-widest">{item.label}</span>
                            </button>
                        );
                    }

                    if (!("href" in item)) return null;

                    const isActive =
                        item.href === pathname ||
                        (item.href === "/shop" && pathname.startsWith("/shop/"));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                                isActive ? activeClass : inactiveClass
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

"use client";

import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Heart, LogOut, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

interface AccountNavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: AccountNavItem[] = [
    { href: "/account", label: "History", icon: Package },
    { href: "/account/profile", label: "Personal Info", icon: User },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

function AccountNav({ variant = "desktop" }: { variant?: "mobile" | "desktop" }) {
    const pathname = usePathname();

    if (variant === "desktop") {
        return (
            <nav className="hidden lg:flex flex-col gap-1" aria-label="Account navigation">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="my-4 border-t border-border" />

                <LogoutLink
                    postLogoutRedirectURL="/"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm transition-colors w-full"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </LogoutLink>
            </nav>
        );
    }

    return (
        <nav
            className="lg:hidden flex gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none [scrollbar-width:none]"
            aria-label="Account navigation"
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors border",
                            isActive
                                ? "bg-accent/10 text-accent border-accent/20"
                                : "text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground pt-28 md:pt-32 pb-24 md:pb-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-12">
                {/* Page Title */}
                <div className="mb-8 lg:mb-12">
                    <h1 className="text-2xl md:text-3xl font-light tracking-tight uppercase">Your Account</h1>
                    <div className="mt-2 h-px bg-border" />
                </div>

                {/* Mobile Nav */}
                <div className="mb-6 lg:hidden">
                    <AccountNav variant="mobile" />
                </div>

                {/* Desktop Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12">
                    {/* Sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-32">
                            <AccountNav variant="desktop" />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="min-w-0">
                        <Suspense fallback={
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-muted rounded w-1/3" />
                                <div className="h-px bg-border" />
                                <div className="h-48 bg-muted rounded" />
                            </div>
                        }>
                            {children}
                        </Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
}

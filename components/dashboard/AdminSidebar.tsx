"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    ListOrdered,
    Settings,
    Gift,
    Globe,
    Mail,
    FileText,
    Activity,
    ShieldAlert,
    Store,
    Tags,
    BarChart3,
    UserCog,
    Brain,
    LogOut,
    ShoppingCart,
    Receipt,
    Sparkles,
    MessageSquare,
    Puzzle,
    Menu,
    X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI COO", href: "/dashboard/ai-coo", icon: Brain },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Vault", href: "/dashboard/premium", icon: Sparkles },
    { name: "Categories", href: "/dashboard/categories", icon: ListOrdered },
    { name: "Attributes", href: "/dashboard/attributes", icon: Tags },
    { name: "Banners", href: "/dashboard/banner", icon: Globe },
    { name: "Discounts", href: "/dashboard/discounts", icon: Gift },
    { name: "Cart Recovery", href: "/dashboard/cart-recovery", icon: ShoppingCart },
    { name: "Tax Rules", href: "/dashboard/tax-rules", icon: Receipt },
    { name: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
    { name: "Contacts", href: "/dashboard/contact", icon: MessageSquare },
    { name: "Integrations", href: "/dashboard/integrations", icon: Puzzle },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Blog", href: "/dashboard/blog", icon: FileText },
    { name: "Roles", href: "/dashboard/roles", icon: UserCog },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Auto-close on unmount or navigation could be added, but handled implicitly by standard UX for now

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40 flex items-center justify-between px-4">
                <h1 className="text-xl font-bold tracking-tighter uppercase text-foreground">Aethelon<span className="text-accent text-xs ml-1 font-normal tracking-widest">ADMIN</span></h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-foreground hover:bg-muted rounded-sm transition-colors"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Backdrop overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={cn(
                "flex flex-col h-full bg-muted/30 border-r border-border w-64 fixed left-0 top-0 bottom-0 z-50 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 pt-16 md:pt-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 hidden md:flex items-center justify-between px-6 border-b border-border absolute top-0 left-0 w-full bg-transparent">
                    <h1 className="text-xl font-bold tracking-tighter uppercase text-foreground">Aethelon<span className="text-accent text-xs ml-1 font-normal tracking-widest">ADMIN</span></h1>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                        title="Back to Store"
                    >
                        <Store className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Store</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto w-full pt-4 md:pt-16">
                    <nav className="px-4 pb-8 space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors",
                                    pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                                        ? "bg-white shadow-sm text-foreground border border-border"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                )}
                            >
                                <link.icon className={cn("w-4 h-4",
                                    pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                                        ? "text-accent"
                                        : "text-muted-foreground/70 group-hover:text-foreground"
                                )} />
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-border space-y-2">
                        <Link href="/dashboard/audit" className="flex items-center gap-3 px-4 py-2 hover:bg-white/50 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest">Audit Logs</span>
                        </Link>
                        <Link href="/dashboard/health" className="flex items-center gap-3 px-4 py-2 hover:bg-white/50 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest">System Health</span>
                        </Link>
                        <Link href="/dashboard/security" className="flex items-center gap-3 px-4 py-2 hover:bg-white/50 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest">Security</span>
                        </Link>
                        <div className="h-px bg-border my-4" />
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-white/50 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest">Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

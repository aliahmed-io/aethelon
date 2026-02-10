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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI COO", href: "/dashboard/ai-coo", icon: Brain },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Categories", href: "/dashboard/categories", icon: ListOrdered },
    { name: "Attributes", href: "/dashboard/attributes", icon: Tags },
    { name: "Banners", href: "/dashboard/banner", icon: Globe },
    { name: "Discounts", href: "/dashboard/discounts", icon: Gift },
    { name: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Roles", href: "/dashboard/roles", icon: UserCog },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-[#050505] border-r border-white/5 w-64 fixed left-0 top-0 bottom-0 z-40">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                <h1 className="text-xl font-bold tracking-tighter uppercase">Velorum<span className="text-white/30 text-xs ml-1">ADMIN</span></h1>
                <Link
                    href="/"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Back to Store"
                >
                    <Store className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Store</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors",
                            pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
                                ? "bg-white/10 text-white"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <link.icon className="w-4 h-4" />
                        {link.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <Link href="/dashboard/audit" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-sm text-zinc-400 hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Audit Logs</span>
                </Link>
                <Link href="/dashboard/health" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-sm text-zinc-400 hover:text-white transition-colors">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">System Health</span>
                </Link>
                <Link href="/dashboard/security" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-sm text-zinc-400 hover:text-white transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Security</span>
                </Link>
                <div className="h-px bg-white/10 my-4" />
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-sm text-zinc-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Settings</span>
                </Link>
            </div>
        </div>
    );
}

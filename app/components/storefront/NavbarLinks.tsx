"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const navbarLinks = [
    { id: 0, name: "Shop", href: "/shop" },
    { id: 1, name: "Try-On", href: "/try-on" },
    { id: 2, name: "Return Policy", href: "/legal/returns" },
    { id: 3, name: "Contact", href: "/contact" },
];

export function NavbarLinks({ className }: { className?: string }) {
    const location = usePathname();

    return (
        <div className={cn("flex flex-col md:flex-row gap-6", className)}>
            {navbarLinks.map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                        "text-sm uppercase tracking-widest transition-colors duration-300",
                        location === item.href
                            ? "text-white font-bold"
                            : "text-white/60 hover:text-white"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </div>
    );
}

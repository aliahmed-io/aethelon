"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navbarLinks = [
  {
    id: 0,
    name: "Home",
    href: "/store/shop",
  },
  {
    id: 1,
    name: "All Products",
    href: "/store/products/all",
  },
  {
    id: 2,
    name: "Men",
    href: "/store/products/men",
  },
  {
    id: 3,
    name: "Women",
    href: "/store/products/women",
  },
  {
    id: 4,
    name: "Kids",
    href: "/store/products/kids",
  },
  {
    id: 5,
    name: "Dressing Room",
    href: "/store/try-on",
    badge: "Beta",
  },
];

export function NavbarLinks() {
  const location = usePathname();
  return (
    <div className="flex flex-col gap-y-3 md:flex-row md:items-center md:gap-x-2">
      {navbarLinks.map((item: any) => (
        <Link
          href={item.href}
          key={item.id}
          prefetch={false}
          className={cn(
            location === item.href
              ? "bg-muted"
              : "hover:bg-muted hover:bg-opacity-75",
            "group p-2 font-medium rounded-md flex items-center gap-1"
          )}
        >
          <span>{item.name}</span>
          {item.badge && (
            <span className="text-[10px] uppercase text-yellow-700 bg-yellow-100 px-1 py-0.5 rounded">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
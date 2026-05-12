"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function AuthButtons() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
            </Button>
            <span className="h-6 w-px bg-gray-200"></span>
            <Button variant="ghost" asChild>
                <Link href="/register">Create Account</Link>
            </Button>
        </div>
    );
}

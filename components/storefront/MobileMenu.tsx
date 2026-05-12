"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavbarLinks } from "./NavbarLinks";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function MobileMenu({ user }: { user: { given_name?: string | null; family_name?: string | null; email?: string | null; picture?: string | null } | null }) {
    const pathname = usePathname();
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-r border-border bg-background/95 backdrop-blur-xl">
                <SheetHeader className="text-left mb-8">
                    <SheetTitle className="text-xl font-bold tracking-tighter uppercase">Aethelon</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-6">
                    <NavbarLinks className="flex-col items-start gap-6" />

                    <div className="h-px w-full bg-border my-2" />

                    {!user ? (
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" asChild className="justify-start border-border text-foreground hover:bg-muted w-full">
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button asChild className="justify-start bg-accent text-accent-foreground hover:bg-accent/90 w-full">
                                <Link href="/register">
                                    Create Account
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <Button variant="ghost" asChild className="justify-start text-muted-foreground hover:text-foreground hover:bg-muted w-full">
                            <Link href="/account">My Account</Link>
                        </Button>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

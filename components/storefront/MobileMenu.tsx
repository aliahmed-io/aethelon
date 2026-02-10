"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavbarLinks } from "./NavbarLinks";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function MobileMenu({ user }: { user: { given_name?: string | null; family_name?: string | null; email?: string | null; picture?: string | null } | null }) {
    const pathname = usePathname();
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white/70 hover:text-white hover:bg-white/5">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-r border-white/10 bg-[#050505]/95 backdrop-blur-xl">
                <SheetHeader className="text-left mb-8">
                    <SheetTitle className="text-xl font-bold tracking-tighter uppercase">Aethelon</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-6">
                    <NavbarLinks className="flex-col items-start gap-6" />

                    <div className="h-px w-full bg-white/10 my-2" />

                    {!user ? (
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" asChild className="justify-start border-white/20 text-white hover:bg-white/10 hover:text-white w-full">
                                <LoginLink postLoginRedirectURL={pathname}>Sign in</LoginLink>
                            </Button>
                            <Button asChild className="justify-start bg-white text-black hover:bg-white/90 w-full">
                                <RegisterLink postLoginRedirectURL={pathname}>
                                    Create Account
                                </RegisterLink>
                            </Button>
                        </div>
                    ) : (
                        <Button variant="ghost" asChild className="justify-start text-white/60 hover:text-white hover:bg-white/5 w-full">
                            <Link href="/account">My Account</Link>
                        </Button>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import { User, Package, Heart, LayoutDashboard } from "lucide-react";

interface UserDropdownProps {
    email: string;
    name: string;
    userImage: string;
    isAdmin?: boolean;
}

export function UserDropdown({ email, name, userImage, isAdmin = false }: UserDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={userImage} alt="User Image" />
                        <AvatarFallback className="bg-white/5 text-white">
                            {(name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64 bg-[#050505]/95 backdrop-blur-xl border-white/10 text-white p-2" align="end" forceMount>
                <DropdownMenuLabel className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none text-white">{name}</p>
                    <p className="text-xs leading-none text-white/50">{email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10 my-2" />

                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer rounded-sm">
                    <Link href="/account" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/50" /> My Account
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer rounded-sm">
                    <Link href="/account" className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-white/50" /> My Orders
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer rounded-sm">
                    <Link href="/wishlist" className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-white/50" /> My Wishlist
                    </Link>
                </DropdownMenuItem>

                {isAdmin && (
                    <>
                        <DropdownMenuSeparator className="bg-white/10 my-2" />
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer rounded-sm">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-white/50" /> Admin Dashboard
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator className="bg-white/10 my-2" />

                <DropdownMenuItem asChild className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-sm text-red-400">
                    <LogoutLink className="w-full">Log out</LogoutLink>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}

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
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={userImage} alt="User Image" />
                        <AvatarFallback className="bg-muted text-foreground">
                            {(name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border text-foreground p-2" align="end" forceMount>
                <DropdownMenuLabel className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none text-foreground">{name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border my-2" />

                <DropdownMenuItem asChild className="focus:bg-muted focus:text-foreground cursor-pointer rounded-sm">
                    <Link href="/account" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" /> My Account
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="focus:bg-muted focus:text-foreground cursor-pointer rounded-sm">
                    <Link href="/account" className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" /> My Orders
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="focus:bg-muted focus:text-foreground cursor-pointer rounded-sm">
                    <Link href="/wishlist" className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" /> My Wishlist
                    </Link>
                </DropdownMenuItem>

                {isAdmin && (
                    <>
                        <DropdownMenuSeparator className="bg-border my-2" />
                        <DropdownMenuItem asChild className="focus:bg-muted focus:text-foreground cursor-pointer rounded-sm">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Admin Dashboard
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator className="bg-border my-2" />

                <DropdownMenuItem asChild className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-sm text-red-400">
                    <LogoutLink className="w-full">Log out</LogoutLink>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}

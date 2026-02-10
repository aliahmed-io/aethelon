import { ReactNode } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/app/components/Navbar"; // Use main navbar for users
import Link from "next/link";
import Image from "next/image";
import { Package, Heart, LogOut } from "lucide-react";

export default async function AccountLayout({ children }: { children: ReactNode }) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* User Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                            {user.picture ? (
                                <Image src={user.picture} alt="Profile" width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold">{user.given_name?.[0]}</span>
                            )}
                        </div>
                        <div>
                            <p className="font-bold">{user.given_name} {user.family_name}</p>
                            <p className="text-xs text-white/50">{user.email}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-white/5 text-white rounded-sm">
                            <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white rounded-sm transition-colors">
                            <Heart className="w-4 h-4" /> Wishlist
                        </Link>
                        <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/50 hover:text-red-400 hover:bg-white/5 rounded-sm transition-colors mt-8">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </Link>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {children}
                </div>
            </div>
        </div>
    );
}

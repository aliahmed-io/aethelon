import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Navbar } from "@/app/components/Navbar";
import { ProductCard } from "@/app/components/shop/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "My Wishlist | Velorum",
};

export default async function WishlistPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return redirect("/api/auth/login");

    const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: {
            product: true
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12">
                <div className="mb-16 border-b border-white/5 pb-8">
                    <h1 className="text-3xl font-light tracking-tight uppercase">My Wishlist</h1>
                    <p className="text-white/50 text-sm font-mono mt-2">{wishlistItems.length} SAVED ITEMS</p>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-sm">
                        <h2 className="text-xl font-light mb-4">Your wishlist is empty</h2>
                        <p className="text-white/40 mb-8 max-w-sm">Curate your personal collection of favorites.</p>
                        <Link href="/shop">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black uppercase tracking-widest text-xs h-12 px-8">
                                Browse Catalog
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="group relative">
                                <ProductCard product={item.product} />
                                {/* Optional remove button logic could go here */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

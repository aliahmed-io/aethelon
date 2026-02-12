import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ProductCard } from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata = {
    title: "My Wishlist | Aethelon",
};

interface WishlistItem {
    id: string;
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        images: string[];
    };
}

export default async function WishlistPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return redirect("/api/auth/login");

    // Mock data for build verification
    const wishlistItems: WishlistItem[] = [];

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">


            <div className="container mx-auto px-6 lg:px-12">
                <div className="mb-16 border-b border-border pb-8">
                    <h1 className="text-3xl font-light tracking-tight uppercase">My Wishlist</h1>
                    <p className="text-muted-foreground text-sm font-mono mt-2">{wishlistItems.length} SAVED ITEMS</p>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-sm">
                        <h2 className="text-xl font-light mb-4">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-8 max-w-sm">Curate your personal collection of favorites.</p>
                        <Link href="/shop">
                            <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground uppercase tracking-widest text-xs h-12 px-8">
                                Browse Catalog
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="group relative">
                                <ProductCard item={{ ...item.product, discountPercentage: 0 } as any} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

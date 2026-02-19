import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Wishlist — Aethelon",
};

type WishlistWithProduct = Prisma.WishlistItemGetPayload<{
    include: { product: true };
}>;

export default async function AccountWishlistPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return redirect("/api/auth/login?post_login_redirect_url=/account/wishlist");

    const rawItems = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            product: true,
        },
    }) as unknown as WishlistWithProduct[];

    // Filter out items where product was deleted
    const wishlistItems = rawItems.filter((item) => item.product !== null);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-light tracking-tight uppercase">Wishlist</h2>
                <span className="text-xs text-muted-foreground font-mono uppercase">
                    {wishlistItems.length} saved item{wishlistItems.length !== 1 ? "s" : ""}
                </span>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-sm">
                    <h3 className="text-lg font-light mb-4">Your wishlist is empty</h3>
                    <p className="text-muted-foreground text-sm mb-8 max-w-sm">
                        Curate your personal collection of favorites.
                    </p>
                    <Link href="/shop">
                        <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground uppercase tracking-widest text-xs h-12 px-8"
                        >
                            Browse Catalog
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="group relative">
                            <ProductCard
                                item={{
                                    id: item.product.id,
                                    name: item.product.name,
                                    description: item.product.description,
                                    price: item.product.price,
                                    images: item.product.images,
                                    discountPercentage: item.product.discountPercentage ?? 0,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

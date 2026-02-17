
import { FurnitureFilterBar } from "@/components/shop/FurnitureFilterBar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import prisma from "@/lib/db";
import { getRecommendedProducts } from "@/app/actions/personalization";
import { ProductStatus, Product, Prisma } from "@prisma/client";

interface ShopPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const { category } = await searchParams;

    const where: Prisma.ProductWhereInput = {
        status: 'published' as ProductStatus,
    };

    // Filter by Category slug (furniture categories: living, dining, bedroom, office)
    if (category && category !== "all") {
        where.categories = {
            some: {
                slug: category as string,
            },
        };
    }

    const [products, recommendations] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
        }),
        getRecommendedProducts()
    ]);

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl lg:text-4xl font-light uppercase tracking-[0.15em] text-foreground mb-2">
                        Furniture
                    </h1>
                    <p className="text-muted-foreground text-sm tracking-wide">
                        Discover our categories
                    </p>
                </div>

                {/* Filter Bar */}
                <FurnitureFilterBar totalCount={products.length} />

                {/* Recommended Section */}
                {recommendations.length > 0 && !category && (
                    <div className="mb-12">
                        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                            Recommended for you
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {recommendations.map((product: Product) => (
                                <ProductCard key={product.id} item={product} />
                            ))}
                        </div>
                        <div className="my-10 border-t border-border/50" />
                    </div>
                )}

                {/* Product Grid */}
                <ProductGrid products={products} />
            </div>
        </main>
    );
}

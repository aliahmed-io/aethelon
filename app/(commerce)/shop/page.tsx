import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import Prisma from "@/lib/db";
import { getRecommendedProducts } from "@/app/actions/personalization";
import { ProductStatus, MainCategory } from "@prisma/client";

// We need to handle searchParams in page
interface ShopPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const { category } = await searchParams;

    // Fetch from Database
    const where: { status: ProductStatus; mainCategory?: MainCategory } = {
        status: 'published',
    };

    if (category) {
        where.mainCategory = (category as string).toUpperCase() as MainCategory;
    }

    const [products, recommendations] = await Promise.all([
        Prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
        }),
        getRecommendedProducts()
    ]);

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">

            <div className="container mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="mb-16 border-b border-border pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-2">
                            COLLECTION
                        </h1>
                        <p className="text-muted-foreground font-mono text-sm tracking-widest">
                            {products.length} REFERENCES FOUND
                        </p>
                    </div>
                </div>

                {recommendations.length > 0 && !category && (
                    <div className="mb-16">
                        <h2 className="text-xl font-light tracking-tight text-foreground mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                            RECOMMENDED FOR YOU
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {recommendations.map((product) => (
                                <div key={product.id} className="h-[400px]">
                                    <ProductCard item={product} />
                                </div>
                            ))}
                        </div>
                        <div className="my-8 border-t border-border/50"></div>
                    </div>
                )}

                <div className="flex gap-12">
                    {/* Sidebar */}
                    <FilterSidebar />

                    {/* Grid */}
                    <div className="flex-1">
                        <ProductGrid products={products} />
                    </div>
                </div>
            </div>
        </main>
    );
}

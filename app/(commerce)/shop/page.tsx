import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductCard } from "@/components/storefront/ProductCard";
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
                        {products.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center p-8 border border-border bg-muted/50 backdrop-blur-md rounded-sm text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <span className="text-xl">🪑</span>
                                </div>
                                <h3 className="text-lg font-light tracking-wide uppercase mb-2">No Products Found</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                    Our collection is currently empty for the selected criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12" data-testid="product-grid">
                                {products.map((product) => (
                                    <ProductCard key={product.id} item={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

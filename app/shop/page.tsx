import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { FilterSidebar } from "@/app/components/shop/FilterSidebar";
import { ProductCard } from "@/app/components/shop/ProductCard";
import { Navbar } from "@/app/components/Navbar";

// We need to handle searchParams in page
interface ShopPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const { category } = await searchParams;
    // Basic filtering based on params
    const categoryFilter = typeof category === 'string' ? category : undefined;

    // Construct where clause
    const where: Prisma.ProductWhereInput = {
        status: 'published', // Only show published
    };

    if (categoryFilter && categoryFilter !== 'all') {
        const orConditions: Prisma.ProductWhereInput[] = [
            { tags: { has: categoryFilter } },
            { name: { contains: categoryFilter, mode: 'insensitive' } }
        ];

        // Only search mainCategory if the filter is a valid enum value (simple check)
        const validCategories = ['MEN', 'WOMEN', 'KIDS'];
        if (validCategories.includes(categoryFilter.toUpperCase())) {
            orConditions.push({ mainCategory: { equals: categoryFilter.toUpperCase() as "MEN" | "WOMEN" | "KIDS" } });
        }

        where.OR = orConditions;
    }

    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
            id: true,
            name: true,
            price: true,
            images: true,
            modelUrl: true,
            mainCategory: true,
            category: {
                select: { name: true }
            },
            status: true,
            // Include other necessary fields for the card if any
        }
    });

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="mb-16 border-b border-white/10 pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-white mb-2">
                            COLLECTION
                        </h1>
                        <p className="text-white/40 font-mono text-sm tracking-widest">
                            {products.length} REFERENCES FOUND
                        </p>
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar */}
                    <FilterSidebar />

                    {/* Grid */}
                    <div className="flex-1">
                        {products.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center p-8 border border-white/5 bg-white/5 backdrop-blur-md rounded-sm text-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <span className="text-xl">⌚</span>
                                </div>
                                <h3 className="text-lg font-light tracking-wide uppercase mb-2">No Timepieces Found</h3>
                                <p className="text-white/40 text-sm max-w-xs mx-auto">
                                    Our ateliers are currently devoid of instruments matching your criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12" data-testid="product-grid">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product as any} />
                                ))}
                                {/* Temporarily casting ProductCard prop to any if mismatch, or better yet, fix ProductCard props. 
                                    But 'product' here has a type from Prisma. 
                                    I'll cast to 'any' ONLY for the prop if needed, but the loop variable shouldn't have :any */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

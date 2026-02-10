import Prisma from "@/lib/db";
import { Suspense } from "react";
import { ProductCard, LoadingProductCard } from "@/components/storefront/ProductCard";

async function getData() {
    const data = await Prisma.product.findMany({
        where: {
            status: "published",
            isFeatured: true,
        },
        take: 3,
        orderBy: {
            createdAt: "desc",
        },
    });

    return data;
}

export function FeaturedProducts() {
    return (
        <section className="py-24 px-4 md:px-8 border-t border-white/5">
            <div className="container mx-auto">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-light uppercase tracking-tight text-white mb-2">Featured Collection</h2>
                        <p className="text-white/40 max-w-md">Curated selection of our finest timepieces.</p>
                    </div>
                </div>

                <Suspense fallback={<LoadingRows />}>
                    <LoadFeaturedProducts />
                </Suspense>
            </div>
        </section>
    );
}

async function LoadFeaturedProducts() {
    const data = await getData();

    if (data.length === 0) {
        return <div className="text-white/30 text-center py-20">No featured products available.</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item) => (
                <ProductCard key={item.id} item={item as any} />
            ))}
        </div>
    );
}

function LoadingRows() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingProductCard />
            <LoadingProductCard />
            <LoadingProductCard />
        </div>
    );
}

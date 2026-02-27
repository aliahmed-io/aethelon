import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { getSmartCollection } from "@/actions/get-collection";
import { CollectionHero } from "@/components/collections/CollectionHero";
import { CollectionFilterBar } from "@/components/collections/CollectionFilterBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    if (slug === 'all') {
        return {
            title: 'All Categories | Aethelon',
            description: 'Explore our complete catalog of premium furniture.'
        };
    }

    // Try Smart Collection
    const data = await getSmartCollection({ slugs: [slug] });
    if (data?.category) {
        return {
            title: `${data.category.name} — Aethelon`,
            description: data.category.description || `Browse ${data.category.name} furniture at Aethelon.`,
        };
    }

    return { title: "Category Not Found — Aethelon" };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Handle "all" slug manually or pass to getSmartCollection
    // getSmartCollection handles empty array or matching logic.
    // If slug is "all", let's pass it as a special case or empty array?
    // My getSmartCollection logic:
    // if (!category && slugs.length > 0 && slugs[0] !== 'all') return empty
    // So if slug is 'all', it proceeds to fetch products with no category filter.

    // We pass [slug] (e.g. ['all'] or ['living']).
    const data = await getSmartCollection({
        slugs: [slug],
        searchParams: resolvedSearchParams
    });

    if (!data.category && slug !== 'all') {
        notFound();
    }

    const categoryName = data.category?.name || "All Products";
    const categoryDesc = data.category?.description || "Explore our complete catalog of premium furniture.";
    const categoryImage = data.category?.image || "/assets/placeholder.svg";

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            {/* Category Hero */}
            <CollectionHero
                title={categoryName}
                description={categoryDesc}
                image={categoryImage}
                breadcrumbs={[slug]}
            />

            <div className="container mx-auto px-4 md:px-8 mt-12">
                <CollectionFilterBar totalCount={data.totalCount} />

                {data.products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-muted-foreground text-lg">No products found in this category.</p>
                    </div>
                ) : (
                    <ProductGrid products={data.products as any} />
                )}
            </div>
        </main>
    );
}

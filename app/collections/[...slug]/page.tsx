
import { notFound } from 'next/navigation';
import { getSmartCollection } from '@/actions/get-collection';
import { Metadata } from 'next';
import { CollectionHero } from '@/components/collections/CollectionHero';
import { SmartProductGrid } from '@/components/collections/SmartProductGrid';

type Props = {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// --- METADATA ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getSmartCollection({ slugs: slug });
    if (!data?.category) return { title: 'Collections | Aethelon' };

    return {
        title: `${data.category.name} | Aethelon Collections`,
        description: data.category.description || `Browse our exclusive ${data.category.name} collection.`,
    };
}

// --- PAGE COMPONENT ---
export default async function CollectionPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const data = await getSmartCollection({
        slugs: slug,
        searchParams: resolvedSearchParams
    });

    if (!data.category && slug[0] !== 'all') {
        notFound();
    }

    const categoryName = data.category?.name || "All Products";
    const categoryDesc = data.category?.description || "Explore our complete catalog of premium furniture.";
    const categoryImage = data.category?.image || "/images/collections/default-hero.jpg";

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            {/* 1. Immersive Hero */}
            <CollectionHero
                title={categoryName}
                description={categoryDesc}
                image={categoryImage}
                breadcrumbs={slug}
            />

            <div className="container mx-auto px-4 md:px-8 mt-12">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* 2. Faceted Sidebar (Mobile Drawer / Desktop Sidebar) */}
                    <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
                        {/* <FilterSidebar /> Placeholder - implement next */}
                        <div className="p-6 bg-card rounded-xl border border-border/50">
                            <h3 className="font-medium mb-4">Filters</h3>
                            <p className="text-sm text-muted-foreground">Price, Color, and Material filters coming soon.</p>
                        </div>
                    </aside>

                    {/* 3. Smart Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-bold text-foreground">{data.products.length}</span> results
                            </p>
                            {/* <SortDropdown /> Placeholder */}
                        </div>

                        <SmartProductGrid products={data.products} />
                    </div>

                </div>
            </div>
        </main>
    );
}

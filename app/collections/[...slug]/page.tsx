import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { CampaignWithProducts } from "@/lib/types/prisma-payloads";
import { getSmartCollection } from "@/actions/get-collection";
import { CollectionHero } from "@/components/collections/CollectionHero";

export const revalidate = 3600;

// --- CAMPAIGN LOGIC ---
async function getCampaign(slug: string): Promise<CampaignWithProducts | null> {
    return prisma.campaign.findUnique({
        where: { slug },
        include: {
            products: {
                orderBy: { order: "asc" },
                include: { product: true },
            },
        },
    }) as unknown as CampaignWithProducts | null;
}

export async function generateStaticParams() {
    try {
        const campaigns = await prisma.campaign.findMany({
            where: { status: "ACTIVE" },
            select: { slug: true },
        });
        return campaigns.map((c) => ({ slug: [c.slug] }));
    } catch (error) {
        console.error("Failed to generate static params for collections:", error);
        return [];
    }
}

// --- METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const slugStr = slug[slug.length - 1]; // Use last segment for campaign check or smart collection

    // 1. Try Campaign
    if (slug.length === 1) {
        const campaign = await getCampaign(slugStr);
        if (campaign) {
            return {
                title: `${campaign.title} — Aethelon Collections`,
                description: campaign.description || `Explore the ${campaign.title} collection from Aethelon.`,
            };
        }
    }

    // 2. Try Smart Collection (Category)
    const data = await getSmartCollection({ slugs: slug });
    if (data?.category) {
        return {
            title: `${data.category.name} | Aethelon Collections`,
            description: data.category.description || `Browse our exclusive ${data.category.name} collection.`,
        };
    }

    if (slug[0] === 'all') {
        return { title: 'All Products | Aethelon Collections', description: 'Explore our complete catalog.' };
    }

    return { title: "Collection Not Found — Aethelon" };
}

// --- PAGE COMPONENT ---
export default async function CollectionDetailPage({ params, searchParams }: { params: Promise<{ slug: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { slug } = await params;
    const slugStr = slug[slug.length - 1];

    console.log('Unified CollectionPage slug:', slug);

    // 1. Try Campaign (only if single segment)
    if (slug.length === 1) {
        const campaign = await getCampaign(slugStr);
        if (campaign) {
            return (
                <main className="min-h-screen bg-background text-foreground">
                    {/* Campaign Hero */}
                    <div className="relative h-[60vh] min-h-[400px] flex items-end">
                        {campaign.heroImage && (
                            <Image
                                src={campaign.heroImage}
                                alt={campaign.title}
                                fill
                                priority
                                className="object-cover"
                                sizes="100vw"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        <div className="relative z-10 container mx-auto max-w-6xl px-6 lg:px-12 pb-12">
                            <Link
                                href="/collections"
                                className="inline-block text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors mb-4"
                            >
                                ← All Collections
                            </Link>
                            <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-3">
                                {campaign.title}
                            </h1>
                            {campaign.description && (
                                <p className="text-foreground/70 text-sm max-w-lg">{campaign.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Campaign Products */}
                    <section className="container mx-auto max-w-6xl px-6 lg:px-12 py-16">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                                {campaign.products.length} piece{campaign.products.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {campaign.products.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-12 text-center">This collection is being curated. Check back soon.</p>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                                {campaign.products.map((cp) => (
                                    <ProductCard
                                        key={cp.productId}
                                        item={cp.product}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            );
        }
    }

    // 2. Try Smart Collection (Category or All)
    const resolvedSearchParams = await searchParams;
    const data = await getSmartCollection({
        slugs: slug,
        searchParams: resolvedSearchParams
    });

    if (!data.category && slug[0] !== 'all') {
        console.log('Unified CollectionPage 404 triggered');
        notFound();
    }

    const categoryName = data.category?.name || "All Products";
    const categoryDesc = data.category?.description || "Explore our complete catalog of premium furniture.";
    const categoryImage = data.category?.image || "/images/collections/default-hero.jpg";

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            {/* Category Hero */}
            <CollectionHero
                title={categoryName}
                description={categoryDesc}
                image={categoryImage}
                breadcrumbs={slug}
            />

            <div className="container mx-auto px-4 md:px-8 mt-12">
                <div className="flex justify-between items-center mb-8">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-bold text-foreground">{data.products.length}</span> result{data.products.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {data.products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-muted-foreground text-lg">No products found for this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                        {data.products.map((product) => (
                            <ProductCard key={product.id} item={product} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

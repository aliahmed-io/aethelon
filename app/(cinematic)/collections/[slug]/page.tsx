import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const revalidate = 3600;

async function getCollection(slug: string) {
    return prisma.campaign.findUnique({
        where: { slug },
        include: {
            products: {
                orderBy: { order: "asc" },
                include: { product: true },
            },
        },
    });
}

export async function generateStaticParams() {
    const campaigns = await prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true },
    });
    return campaigns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const collection = await getCollection(slug);
    if (!collection) return { title: "Collection Not Found — Aethelon" };
    return {
        title: `${collection.title} — Aethelon Collections`,
        description: collection.description || `Explore the ${collection.title} collection from Aethelon.`,
    };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const collection = await getCollection(slug);
    if (!collection) return notFound();

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Hero */}
            <div className="relative h-[60vh] min-h-[400px] flex items-end">
                {collection.heroImage && (
                    <Image
                        src={collection.heroImage}
                        alt={collection.title}
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
                        {collection.title}
                    </h1>
                    {collection.description && (
                        <p className="text-foreground/70 text-sm max-w-lg">{collection.description}</p>
                    )}
                </div>
            </div>

            {/* Products grid */}
            <section className="container mx-auto max-w-6xl px-6 lg:px-12 py-16">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                        {collection.products.length} piece{collection.products.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {collection.products.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-12 text-center">This collection is being curated. Check back soon.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {collection.products.map((cp) => (
                            <Link
                                key={cp.productId}
                                href={`/shop/${cp.productId}`}
                                className="group"
                            >
                                <article>
                                    <div className="aspect-square relative overflow-hidden rounded-sm bg-muted mb-4">
                                        {cp.product.images[0] && (
                                            <Image
                                                src={cp.product.images[0]}
                                                alt={cp.product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        )}
                                        {cp.badge && (
                                            <span className="absolute top-3 left-3 px-3 py-1 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest font-bold rounded-sm">
                                                {cp.badge}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-medium group-hover:text-accent transition-colors mb-1">
                                        {cp.product.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-mono">{formatPrice(cp.product.price)}</p>
                                    {cp.highlightText && (
                                        <p className="text-xs text-accent mt-1">{cp.highlightText}</p>
                                    )}
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

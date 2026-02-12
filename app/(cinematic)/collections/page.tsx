import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";

export const metadata: Metadata = {
    title: "Collections — Aethelon",
    description: "Explore curated collections of modern furniture. Handcrafted with FSC-certified hardwoods.",
};

export const revalidate = 3600; // ISR: refresh every hour

async function getCollections() {
    const campaigns = await prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { products: { take: 4, include: { product: true } } },
    });
    return campaigns;
}

export default async function CollectionsPage() {
    const collections = await getCollections();

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-6xl px-6 lg:px-12">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter mb-4">
                        Collections
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Curated ensembles designed to transform your space.
                    </p>
                </header>

                {collections.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No active collections at the moment. Check back soon.</p>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {collections.map((collection, idx) => (
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.slug}`}
                                className="group block"
                            >
                                <article className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${idx % 2 === 1 ? "lg:direction-rtl" : ""}`}>
                                    <div className="aspect-[4/3] relative overflow-hidden rounded-sm bg-muted">
                                        {collection.heroImage ? (
                                            <Image
                                                src={collection.heroImage}
                                                alt={collection.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                priority={idx === 0}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                                                ◆
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center lg:px-8">
                                        <span className="text-xs uppercase tracking-widest text-accent mb-3 font-mono">
                                            {collection.products.length} pieces
                                        </span>
                                        <h2 className="text-3xl font-bold tracking-tight mb-4 group-hover:text-accent transition-colors">
                                            {collection.title}
                                        </h2>
                                        {collection.description && (
                                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                                                {collection.description}
                                            </p>
                                        )}
                                        <span className="text-xs uppercase tracking-widest text-foreground font-mono group-hover:text-accent transition-colors">
                                            Explore Collection →
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

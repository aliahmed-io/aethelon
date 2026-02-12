import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

async function getCategoryWithProducts(slug: string, page: number) {
    const pageSize = 12;
    const category = await prisma.category.findUnique({
        where: { slug },
    });

    if (!category) return null;

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where: { categoryId: category.id, status: "published" },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.product.count({
            where: { categoryId: category.id, status: "published" },
        }),
    ]);

    return {
        category,
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
    };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getCategoryWithProducts(slug, 1);
    if (!data) return { title: "Category Not Found — Aethelon" };
    return {
        title: `${data.category.name} — Aethelon`,
        description: data.category.description || `Browse ${data.category.name} furniture at Aethelon.`,
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { slug } = await params;
    const { page: pageStr } = await searchParams;
    const page = Math.max(1, parseInt(pageStr || "1", 10));

    const data = await getCategoryWithProducts(slug, page);
    if (!data) return notFound();

    const { category, products, totalCount, totalPages, currentPage } = data;

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-6xl px-6 lg:px-12">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8" aria-label="Breadcrumb">
                    <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground">{category.name}</span>
                </nav>

                {/* Header */}
                <header className="mb-12">
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter mb-3">{category.name}</h1>
                    {category.description && (
                        <p className="text-muted-foreground text-sm max-w-lg">{category.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono mt-4">
                        {totalCount} product{totalCount !== 1 ? "s" : ""}
                    </p>
                </header>

                {/* Product Grid */}
                {products.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-12 text-center">No products in this category yet.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link key={product.id} href={`/shop/${product.id}`} className="group">
                                <div className="aspect-square relative overflow-hidden rounded-sm bg-muted mb-3">
                                    {product.images[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    )}
                                    {product.discountPercentage > 0 && (
                                        <span className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[10px] uppercase tracking-widest font-bold rounded-sm">
                                            -{product.discountPercentage}%
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium truncate group-hover:text-accent transition-colors">{product.name}</h3>
                                <p className="text-xs text-muted-foreground font-mono">{formatPrice(product.price)}</p>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-2 mt-16" aria-label="Pagination">
                        {currentPage > 1 && (
                            <Link
                                href={`/categories/${slug}?page=${currentPage - 1}`}
                                className="px-4 py-2 border border-border text-xs uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
                            >
                                Previous
                            </Link>
                        )}
                        <span className="text-xs text-muted-foreground font-mono px-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        {currentPage < totalPages && (
                            <Link
                                href={`/categories/${slug}?page=${currentPage + 1}`}
                                className="px-4 py-2 border border-border text-xs uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
                            >
                                Next
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </main>
    );
}

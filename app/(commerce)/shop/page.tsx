import type { Metadata } from "next";
import { FurnitureFilterBar } from "@/components/shop/FurnitureFilterBar";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import prisma from "@/lib/db";
import { ProductStatus, Prisma } from "@prisma/client";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://aethelon.com";

export const metadata: Metadata = {
    title: "Shop",
    description:
        "Browse Aethelon's full collection of premium, sustainably crafted furniture. Filter by category, style, price, and more.",
    alternates: { canonical: `${BASE_URL}/shop` },
    openGraph: {
        title: "Shop Premium Furniture — Aethelon",
        description:
            "Browse our full collection of sustainably crafted premium furniture pieces.",
        url: `${BASE_URL}/shop`,
        type: "website",
    },
    twitter: {
        title: "Shop Premium Furniture — Aethelon",
        description:
            "Browse our full collection of sustainably crafted premium furniture pieces.",
    },
};

// SSR: product listings must be fresh and must not hit DB during build.
export const dynamic = "force-dynamic";

interface ShopPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


export default async function ShopPage({ searchParams }: ShopPageProps) {
    const { category, sort, price, color, size, style } = await searchParams;

    // Build Where Clause
    const where: Prisma.ProductWhereInput = {
        status: 'published' as ProductStatus,
        isVaultExclusive: false,
    };

    // Category Filter
    if (category && category !== "all") {
        where.categories = {
            some: {
                slug: category as string,
            },
        };
    }

    // Price Filter (Cents)
    if (price && price !== "all") {
        if (price === "under-500") {
            where.price = { lte: 50000 };
        } else if (price === "500-1000") {
            where.price = { gte: 50000, lte: 100000 };
        } else if (price === "1000-2500") {
            where.price = { gte: 100000, lte: 250000 };
        } else if (price === "over-2500") {
            where.price = { gte: 250000 };
        }
    }

    // Color Filter (insensitive contains)
    if (color && color !== "all") {
        where.color = {
            contains: color as string,
            mode: "insensitive",
        };
    }

    // Size Filter
    if (size && size !== "all") {
        where.sizes = {
            has: size as string,
        };
    }

    // Style Filter
    if (style && style !== "all") {
        where.style = {
            contains: style as string,
            mode: "insensitive",
        };
    }

    // Build OrderBy Clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

    switch (sort) {
        case "price-asc":
        case "price_asc":
            orderBy = { price: "asc" };
            break;
        case "price-desc":
        case "price_desc":
            orderBy = { price: "desc" };
            break;
        case "best-sellers":
        case "popularity":
            orderBy = { reviewCount: "desc" }; // Using review count as proxy for legacy best-sellers
            break;
        case "top-rated":
            orderBy = { averageRating: "desc" };
            break;
        case "name-asc":
            orderBy = { name: "asc" };
            break;
        case "name-desc":
            orderBy = { name: "desc" };
            break;
        case "newest":
        default:
            orderBy = { createdAt: "desc" };
    }

    // Fetch Data
    const [products, categories] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
        }),
        prisma.category.findMany({
            where: {
                parentId: null,
                slug: { notIn: ['best-sellers', 'new-arrivals', 'comfort', 'sustainable', 'decor'] } // Exclude non-furniture pseudo-categories
            },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true }
        })
    ]);

    const sizes = ["Small", "Standard", "Large", "Oversized", "King", "Queen"];

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl lg:text-4xl font-light uppercase tracking-[0.15em] text-foreground mb-2">
                        Shop
                    </h1>
                    <p className="text-muted-foreground text-sm tracking-wide">
                        Explore our curated collection
                    </p>
                </div>

                {/* Filter Bar */}
                <FurnitureFilterBar
                    totalCount={products.length}
                    categories={categories}
                    sizes={sizes}
                />

                {/* Product Grid */}
                <ProductGrid products={products} />
            </div>
        </main>
    );
}


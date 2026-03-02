'use server';

import prisma from '@/lib/db';
import { Product, Category, Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

// --- TYPES ---
export type SmartCollectionResult = {
    category: Category | null;
    products: Product[];
    totalCount: number;
};

export type CollectionParams = {
    slugs: string[]; // e.g. ['living-room', 'sofas']
    searchParams?: {
        sort?: string;
        priceMin?: string;
        priceMax?: string;
        [key: string]: string | string[] | undefined;
    };
};

// --- HELPER: Resolve Category from Slugs ---
async function resolveCategoryHierarchy(slugs: string[]) {
    // If no slugs, return null (All Products case, handled separately if needed)
    if (!slugs || slugs.length === 0) return null;

    const targetSlug = slugs[slugs.length - 1];

    // Fetch all categories with this slug
    const candidates = await prisma.category.findMany({
        where: { slug: targetSlug },
        include: { parent: true }
    });

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Ambiguity resolution: Check parent slug
    if (slugs.length > 1) {
        const parentSlug = slugs[slugs.length - 2];
        const match = candidates.find(c => c.parent?.slug === parentSlug);
        return match || candidates[0]; // Fallback
    }

    return candidates[0];
}

// --- HELPER: Get Recursive Category IDs ---
async function getCategoryTreeIds(rootId: string): Promise<string[]> {
    // 1. Fetch children
    const children = await prisma.category.findMany({
        where: { parentId: rootId },
        select: { id: true }
    });

    // 2. Recursively get their children (BFS/DFS)
    // For MVP, 1 level deep is often enough, but let's do 2 levels max 
    let ids = [rootId, ...children.map(c => c.id)];

    // Fetch grandchildren
    if (children.length > 0) {
        const grandChildren = await prisma.category.findMany({
            where: { parentId: { in: children.map(c => c.id) } },
            select: { id: true }
        });
        ids = [...ids, ...grandChildren.map(c => c.id)];
    }

    return ids;
}

// --- MAIN ACTION ---
export async function getSmartCollection({ slugs, searchParams }: CollectionParams): Promise<SmartCollectionResult> {
    console.log('getSmartCollection called with slugs:', slugs);
    const category = await resolveCategoryHierarchy(slugs);

    if (!category && slugs.length > 0 && slugs[0] !== 'all') {
        return { category: null, products: [], totalCount: 0 };
    }

    // 1. Determine Product Scope (Category IDs)
    let categoryIds: string[] = [];
    if (category) {
        // Cache the tree ID resolution
        const getCachedTree = unstable_cache(
            async () => getCategoryTreeIds(category.id),
            [`category-tree-${category.id}`],
            { revalidate: 3600, tags: [`category-${category.id}`] }
        );
        categoryIds = await getCachedTree();
    }

    // 2. Build Prisma Query
    const where: Prisma.ProductWhereInput = {
        status: 'published',
        isVaultExclusive: false,
    };

    // Filter by Category Scope (Many-to-Many)
    if (categoryIds.length > 0) {
        where.categories = {
            some: {
                id: { in: categoryIds }
            }
        };
    }

    // Filter by Price
    if (searchParams?.priceMin || searchParams?.priceMax) {
        where.price = {};
        if (searchParams.priceMin) where.price.gte = Number(searchParams.priceMin) * 100;
        if (searchParams.priceMax) where.price.lte = Number(searchParams.priceMax) * 100;
    }

    // 3. Ranking Configuration
    let orderBy: Prisma.ProductOrderByWithRelationInput = { staticScore: 'desc' };

    if (searchParams?.sort) {
        switch (searchParams.sort) {
            case 'price-asc':
                orderBy = { price: 'asc' };
                break;
            case 'price-desc':
                orderBy = { price: 'desc' };
                break;
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'oldest':
                orderBy = { createdAt: 'asc' };
                break;
            case 'relevance':
                orderBy = { staticScore: 'desc' };
                break;
            case 'best-sellers':
                orderBy = { reviewCount: 'desc' };
                break;
            case 'top-rated':
                orderBy = { averageRating: 'desc' };
                break;
            case 'name-asc':
                orderBy = { name: 'asc' };
                break;
            case 'name-desc':
                orderBy = { name: 'desc' };
                break;
        }
    }

    // Pagination
    const page = Number(searchParams?.page) || 1;
    const limit = 100; // Fixed for now, or make dynamic
    const skip = (page - 1) * limit;

    // 4. Fetch Products
    const products = await prisma.product.findMany({
        where,
        take: limit,
        skip: skip,
        include: {
            categories: true,
            inventoryTransactions: false,
            variants: {
                select: { colorHex: true }
            }
        },
        orderBy: orderBy
    });

    const rankedProducts = products;

    // 5. In-Memory Inventory Boost
    // Keep out-of-stock items at the bottom regardless of sort
    rankedProducts.sort((a, b) => {
        const aStock = a.stockQuantity > 0 ? 1 : 0;
        const bStock = b.stockQuantity > 0 ? 1 : 0;

        // Always prioritize in-stock items
        if (aStock !== bStock) return bStock - aStock;

        // If stock status is same, preserve database sort (which is stable-ish)
        return 0;
    });

    return {
        category,
        products: rankedProducts,
        totalCount: products.length
    };
}

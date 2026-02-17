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

    // Find category by slug
    // In a real robust system, we would verify the entire path (parent checks)
    // For MVP, unique slug + parentId composite is enough, but we just find by slug matches.
    // Since slug+parentId is unique, we might have duplicates of 'sofas'.
    // We need to resolve the path.

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
    // or use a raw recursive CTE if optimizing. 
    // Here we assume max depth 2 for simplicity.

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

    // 3. Fetch Products (Base Set)
    // We fetch a bit more than needed to allow for re-ranking
    const products = await prisma.product.findMany({
        where,
        take: 100, // Fetch top 100 candidates
        include: {
            categories: true,
            inventoryTransactions: false, // Don't need history, just stock check (field is stockQuantity)
        },
        orderBy: {
            // Default sort if no smart ranking
            staticScore: 'desc'
        }
    });

    // 4. Smart Ranking (In-Memory)
    // If we had a specific user semantic query, we would use vector search here instead of findMany
    // For standard collection view, we rely on `staticScore` + dynamic boosts.

    const rankedProducts = products;

    // Apply Inventory Boost (Dynamic)
    // Push out-of-stock to bottom
    rankedProducts.sort((a, b) => {
        const aStock = a.stockQuantity > 0 ? 1 : 0;
        const bStock = b.stockQuantity > 0 ? 1 : 0;
        if (aStock !== bStock) return bStock - aStock; // 1 before 0

        // Secondary: Static Score
        return (b.staticScore || 0) - (a.staticScore || 0);
    });

    return {
        category,
        products: rankedProducts,
        totalCount: products.length
    };
}

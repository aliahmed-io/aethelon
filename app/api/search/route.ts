import { NextRequest, NextResponse } from "next/server";
import prisma, { safeQuery } from "@/lib/db";
import logger from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';


import { searchProductsHybrid } from "@/lib/search/hybrid";

import { trackSearchQuery } from "@/lib/search/analytics";

/** Extracts the real client IP safely without relying on the unstable `.ip` accessor. */
function getClientIp(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        "127.0.0.1"
    );
}

// GET handler for direct search queries
export async function GET(request: NextRequest) {
    // Rate Limit: 60 requests per minute by IP
    const ip = getClientIp(request);
    const { success } = ip === "127.0.0.1" || ip === "::1" ? { success: true } : await rateLimit(`search-get-${ip}`, 60, "60 s");

    if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "newest";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query && !category) {
        return NextResponse.json({ products: [], total: 0 });
    }

    try {
        let products: unknown[] = [];
        let total = 0;

        // Use Hybrid Search if a textual query is present
        if (query && query.trim()) {
            products = await searchProductsHybrid({
                query,
                category: category || undefined,
                minPrice: minPrice ? Math.round(parseFloat(minPrice) * 100) : undefined,
                maxPrice: maxPrice ? Math.round(parseFloat(maxPrice) * 100) : undefined,
                inStock: inStock === "true",
                limit
            });
            total = products.length; // Hybrid search doesn't support total count efficiently yet

            // Fire & Forget Analytics
            trackSearchQuery({
                query,
                resultsCount: total,
                userId: null
            });
        } else {
            // Fallback to Standard DB Filter
            const result = await searchProducts({ query, category, minPrice, maxPrice, inStock, sortBy, limit });
            products = result.products;
            total = result.total;
        }

        return NextResponse.json(
            { products, total, query, filters: { category, minPrice, maxPrice, inStock, sortBy } },
            { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' } }
        );
    } catch (error) {
        logger.error({ err: error }, "[Search API Error]");
        return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
    }
}

// POST handler for SearchOverlay compatibility
// H-2: Rate-limited to 30 req/min per IP to prevent DB enumeration / scraping.
export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    const { success } = await rateLimit(`search-post-${ip}`, 30, "60 s");
    if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const body = await request.json() as { query?: string; searchType?: string };
        const { query, searchType } = body;

        if (!query) {
            return NextResponse.json({ results: [] });
        }

        // Try Hybrid Search first, will inherently fallback to Lexical if embeddings fail
        const products = await searchProductsHybrid({ query, limit: 12 });

        return NextResponse.json(
            { results: products, searchType },
            { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' } }
        );
    } catch (error) {
        logger.error({ err: error }, "[Search API Error]");
        return NextResponse.json({ error: "Failed to search products", results: [] }, { status: 500 });
    }
}


// Shared search function
async function searchProducts({
    query,
    category,
    minPrice,
    maxPrice,
    inStock,
    sortBy = "newest",
    limit = 20
}: {
    query?: string | null;
    category?: string | null;
    minPrice?: string | null;
    maxPrice?: string | null;
    inStock?: string | null;
    sortBy?: string;
    limit?: number;
}) {
    const where: any = { status: "published" };

    // Full-text search
    if (query && query.trim()) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
        ];
    }

    // Category filter
    if (category && category !== "all") {
        where.categories = { some: { name: { contains: category, mode: "insensitive" } } };
    }

    // Price range (Input is likely dollars e.g. "10.50", DB is cents)
    if (minPrice) where.price = { ...where.price, gte: Math.round(parseFloat(minPrice) * 100) };
    if (maxPrice) where.price = { ...where.price, lte: Math.round(parseFloat(maxPrice) * 100) };

    // In-stock
    if (inStock === "true") where.stockQuantity = { gt: 0 };

    // Order by
    let orderBy: any = { createdAt: "desc" };
    switch (sortBy) {
        case "price_asc": orderBy = { price: "asc" }; break;
        case "price_desc": orderBy = { price: "desc" }; break;
        case "popular": orderBy = { reviewCount: "desc" }; break;
        case "rating": orderBy = { averageRating: "desc" }; break;
    }

    const [products, total] = await Promise.all([
        safeQuery(
            prisma.product.findMany({
                where,
                orderBy,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                    mainCategory: true,
                    stockQuantity: true,
                    averageRating: true,
                    reviewCount: true,
                    categories: { select: { name: true } }
                }
            }),
            []
        ),
        safeQuery(prisma.product.count({ where }), 0)
    ]);

    return { products, total };
}


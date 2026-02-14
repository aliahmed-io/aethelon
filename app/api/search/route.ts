import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import logger from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';


// GET handler for direct search queries
export async function GET(request: NextRequest) {
    // Rate Limit: 60 requests per minute by IP
    // Fix: Use generic header check or trust proxy if configured
    // @ts-ignore - NextRequest has .ip but types might be lagging or strict
    const ip = request.ip ?? request.headers.get("x-forwarded-for")?.split(',')[0] ?? "127.0.0.1";
    const { success } = await rateLimit(`search-${ip}`, 60, "60 s");

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
        const { products, total } = await searchProducts({ query, category, minPrice, maxPrice, inStock, sortBy, limit });
        return NextResponse.json({ products, total, query, filters: { category, minPrice, maxPrice, inStock, sortBy } });
    } catch (error) {
        logger.error({ err: error }, "[Search API Error]");
        return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
    }
}

// POST handler for SearchOverlay compatibility
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, searchType } = body;

        if (!query) {
            return NextResponse.json({ results: [] });
        }

        const { products } = await searchProducts({ query, limit: 20 });

        // For AI search, we could add ranking logic here
        // For now, both types return the same results
        return NextResponse.json({ results: products, searchType });
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
        const validCategories = ["MEN", "WOMEN", "KIDS"];
        if (validCategories.includes(category.toUpperCase())) {
            where.mainCategory = category.toUpperCase();
        } else {
            where.category = { name: { contains: category, mode: "insensitive" } };
        }
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
                category: { select: { name: true } }
            }
        }),
        prisma.product.count({ where })
    ]);

    return { products, total };
}


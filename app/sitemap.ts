import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const products = await prisma.product.findMany({
        select: {
            id: true,
            createdAt: true,
        },
    });

    const categories = await prisma.category.findMany({
        select: {
            slug: true,
        },
    });

    const productUrls = products.map((product) => {
        return {
            url: `${baseUrl}/shop/${product.id}`,
            lastModified: product.createdAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        };
    });

    const categoryUrls = categories.map((category) => {
        return {
            url: `${baseUrl}/shop?category=${category.slug}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.9,
        };
    });

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/try-on`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/legal/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/returns`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/shipping`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.5,
        },
        ...categoryUrls,
        ...productUrls,
    ];
}

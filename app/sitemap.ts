import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Ensure we don't output localhost in production if env is missing
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://aethelon.com";

    // Fetch all dynamic entities
    const [products, categories, posts, campaigns] = await Promise.all([
        prisma.product.findMany({
            select: { id: true, createdAt: true },
        }),
        prisma.category.findMany({
            select: { slug: true, updatedAt: true },
        }),
        prisma.blogPost.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true },
        }),
        prisma.campaign.findMany({
            where: { status: "ACTIVE" },
            select: { slug: true, updatedAt: true },
        }),
    ]);

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/shop/${product.id}`,
        lastModified: product.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: category.updatedAt || new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
    }));

    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const campaignUrls = campaigns.map((campaign) => ({
        url: `${baseUrl}/campaigns/${campaign.slug}`,
        lastModified: campaign.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/campaigns`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ai-search`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/ai-vision`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },

        {
            url: `${baseUrl}/try-on`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/wholesale`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/tracking`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/legal/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/returns`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/shipping`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.3,
        },
    ];

    return [
        ...staticRoutes,
        ...categoryUrls,
        ...productUrls,
        ...postUrls,
        ...campaignUrls,
    ];
}

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard/", "/api/", "/checkout/", "/bag/", "/account/"],
            },
            {
                userAgent: ["GPTBot", "PerplexityBot", "CCBot", "Google-Extended"],
                allow: ["/shop/", "/about", "/campaigns/"],
                disallow: ["/dashboard/", "/api/", "/checkout/"],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

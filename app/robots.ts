import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/dashboard/", "/api/", "/checkout/", "/bag/", "/account/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

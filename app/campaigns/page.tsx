import Prisma from "@/lib/db";
import { CampaignClient } from "./CampaignClient";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
    const [banners, featuredProducts] = await Promise.all([
        Prisma.banner.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1, // Only take the latest banner for hero
        }),
        Prisma.product.findMany({
            where: { isFeatured: true, status: "published" },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                images: true,
            }
        }),
    ]);

    const heroBanner = banners[0] || null;

    return <CampaignClient heroBanner={heroBanner} featuredProducts={featuredProducts} />;
}


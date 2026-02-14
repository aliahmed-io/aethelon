import Prisma from "@/lib/db";
import { CampaignClient } from "../CampaignClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const campaign = await Prisma.campaign.findUnique({
        where: { slug: params.slug },
        select: { title: true, description: true }
    });

    if (!campaign) return { title: "Campaign Not Found" };

    return {
        title: `${campaign.title} | Aethelon`,
        description: campaign.description || "View our latest collection.",
    };
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
    const campaign = await Prisma.campaign.findUnique({
        where: { slug: params.slug },
        include: {
            products: {
                where: {
                    product: { status: "published" }
                },
                include: {
                    product: true
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });

    if (!campaign) {
        return notFound();
    }

    // Adapt to CampaignClient expected props
    // We treat the Campaign as a "HeroBanner" for the UI
    const fakeBanner = campaign.heroImage ? {
        id: campaign.id,
        title: campaign.title,
        imageString: campaign.heroImage,
        link: null // No link needed, we are on the page
    } : null;

    return <CampaignClient heroBanner={fakeBanner} featuredProducts={campaign.products.map(cp => cp.product)} />;
}

import Prisma from "@/lib/db";
import { CampaignClient } from "../CampaignClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import type { CampaignWithProducts } from "@/lib/types/prisma-payloads";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const campaign = await Prisma.campaign.findUnique({
        where: { slug },
        select: { title: true, description: true }
    });

    if (!campaign) return { title: "Campaign Not Found" };

    return {
        title: `${campaign.title} | Aethelon`,
        description: campaign.description || "View our latest collection.",
    };
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const campaign = await Prisma.campaign.findUnique({
        where: { slug },
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
    }) as unknown as CampaignWithProducts | null;

    if (!campaign) {
        return notFound();
    }

    const featuredProducts = campaign.products.map((cp) => cp.product);

    return (
        <CampaignClient
            campaign={campaign as any}
            products={featuredProducts}
            footer={<Footer />}
        />
    );
}

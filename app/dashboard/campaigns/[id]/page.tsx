import Prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { EditCampaignForm } from "./EditCampaignForm";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [campaign, products] = await Promise.all([
        Prisma.campaign.findUnique({
            where: { id },
            include: {
                products: {
                    include: { product: true },
                    orderBy: { order: "asc" },
                },
            },
        }),
        Prisma.product.findMany({
            where: { status: "published" },
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, price: true, images: true },
        }),
    ]);

    if (!campaign) return notFound();

    return (
        <EditCampaignForm
            campaign={campaign as any}
            products={products}
        />
    );
}

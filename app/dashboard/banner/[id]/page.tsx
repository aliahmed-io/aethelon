import Prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { EditBannerForm } from "./EditBannerForm";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [banner, campaigns] = await Promise.all([
        Prisma.banner.findUnique({ where: { id } }),
        Prisma.campaign.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, title: true, slug: true },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    if (!banner) return notFound();

    return <EditBannerForm banner={banner as any} campaigns={campaigns} />;
}

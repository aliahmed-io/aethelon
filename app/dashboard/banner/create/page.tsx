import Prisma from "@/lib/db";
import { CreateBannerForm } from "./CreateBannerForm";

export default async function CreateBannerPage() {
    const campaigns = await Prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true }
    });

    return <CreateBannerForm campaigns={campaigns} />;
}

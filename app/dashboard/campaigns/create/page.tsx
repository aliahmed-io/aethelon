import Prisma from "@/lib/db";
import { CreateCampaignForm } from "./CreateCampaignForm";

export default async function CreateCampaignPage() {
    const products = await Prisma.product.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            price: true,
            images: true
        }
    });

    return <CreateCampaignForm products={products} />;
}

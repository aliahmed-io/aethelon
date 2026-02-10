import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";

export const getCachedProductCatalog = unstable_cache(
    async () => {
        return await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                images: true,
                color: true,
                style: true,
                height: true,
                pattern: true,
                tags: true,
                features: true,
                sizes: true,
                imageDescription: true, // Vision AI description
                mainCategory: true,
                category: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    },
    ["shared-product-catalog"],
    { revalidate: 3600, tags: ["products"] }
);

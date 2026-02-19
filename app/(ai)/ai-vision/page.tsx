import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import prisma from "@/lib/db";
import { RoomVisualizerClient } from "@/components/visualizer/RoomVisualizerClient";
import type { VisualizerProduct } from "@/components/visualizer/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Room Visualizer | Aethelon",
    description:
        "See Aethelon furniture in your space. Interactive 3D viewer on desktop, augmented reality on mobile. Upload a photo of your room or choose from curated environments.",
    openGraph: {
        title: "Room Visualizer | Aethelon",
        description: "Visualize premium furniture in your space with AR and 3D.",
    },
};

import { Product, Category } from "@prisma/client";

// ...

async function getVisualizerProducts(): Promise<VisualizerProduct[]> {
    const products = (await prisma.product.findMany({
        where: {
            modelUrl: { not: null },
            status: "published",
        },
        include: {
            categories: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: [{ isFeatured: "desc" }, { staticScore: "desc" }],
        take: 24,
    })) as unknown as (Product & { categories: { id: string; name: string }[] })[];

    return products
        .filter((p) => p.modelUrl !== null)
        .map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            images: p.images,
            modelUrl: p.modelUrl!, // Assert non-null after filter
            usdzUrl: p.usdzUrl,
            categories: p.categories,
        }));
}

interface AIVisionPageProps {
    searchParams: Promise<{ product?: string }>;
}

export default async function AIVisionPage({ searchParams }: AIVisionPageProps) {
    const { product: preselectedProductId } = await searchParams;
    const products = await getVisualizerProducts();

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
                            Loading Visualizer
                        </p>
                    </div>
                </div>
            }
        >
            <RoomVisualizerClient
                products={products}
                preselectedProductId={preselectedProductId}
            />
        </Suspense>
    );
}

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import prisma, { safeQuery } from "@/lib/db";
import type { Metadata } from "next";
import { ARCoordinator } from "@/components/ar/ARCoordinator";
import type { VisualizerProduct } from "@/components/visualizer/types";
import { Product } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "AR Try-On | Aethelon",
    description:
        "Place Aethelon furniture in your real space using augmented reality. Point your camera at the floor and see the piece in your room.",
};

async function getVisualizerProducts(): Promise<VisualizerProduct[]> {
    const products = (await safeQuery(
        prisma.product.findMany({
            where: {
                modelUrl: { not: null },
            },
            include: {
                categories: { select: { id: true, name: true } },
            },
            orderBy: { staticScore: "desc" },
            take: 24,
            cacheStrategy: { swr: 60, ttl: 3600 },
        }),
        []
    )) as unknown as any[];

    return products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: p.images,
        isVaultExclusive: p.isVaultExclusive,
        modelUrl: p.modelUrl!, // Assert non-null after DB filter
        usdzUrl: p.usdzUrl,
        categories: p.categories,
    }));
}

export default async function ARPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const { id } = await searchParams;
    const products = await getVisualizerProducts();

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
                            Loading AR Experience
                        </p>
                    </div>
                </div>
            }
        >
            <ARCoordinator
                products={products}
                preselectedProductId={id}
            />
        </Suspense>
    );
}

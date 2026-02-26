import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma, { safeQuery } from "@/lib/db";
import { ArSession } from "@/components/ar/ArSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "AR Try-On | Aethelon",
    description:
        "Place Aethelon furniture in your real space using augmented reality. Point your camera at the floor and see the piece in your room.",
};

interface ARProduct {
    id: string;
    name: string;
    price: number;
    modelUrl: string;
    usdzUrl: string | null;
    images: string[];
}

async function getARProducts(): Promise<ARProduct[]> {
    const rows = await safeQuery(
        prisma.product.findMany({
            where: { status: "published", NOT: { modelUrl: null } },
            select: {
                id: true, name: true, price: true,
                modelUrl: true, usdzUrl: true, images: true,
            },
            orderBy: [{ isFeatured: "desc" }, { staticScore: "desc" }],
            take: 24,
        }),
        []
    );

    return rows
        .filter((p) => p.modelUrl !== null)
        .map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            modelUrl: p.modelUrl as string,
            usdzUrl: p.usdzUrl,
            images: p.images,
        }));
}

export default async function ARPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const { id } = await searchParams;
    const allProducts = await getARProducts();

    let selected: ARProduct | null = null;

    if (id) {
        selected = allProducts.find((p) => p.id === id) ?? null;

        // Product exists but has no 3D model → fall through to picker
        if (!selected) {
            const exists = await prisma.product.findUnique({
                where: { id },
                select: { id: true },
            });
            if (!exists) notFound();
        }
    }

    const fallbackSelected = selected ?? allProducts[0] ?? null;

    if (!fallbackSelected) {
        notFound();
    }

    return (
        <ArSession
            modelUrl={fallbackSelected.modelUrl}
            usdzUrl={fallbackSelected.usdzUrl}
            related3DProducts={allProducts
                .filter((p) => p.id !== fallbackSelected.id)
                .map((p) => ({
                    id: p.id,
                    name: p.name,
                    modelUrl: p.modelUrl,
                    image: p.images[0] ?? "",
                }))}
        />
    );
}

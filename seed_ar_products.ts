// @ts-nocheck
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://aethelon.com";

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

const AR_PRODUCTS = [
    {
        name: "Velvet Accent Chair",
        description: "A refined accent chair upholstered in deep velvet, featuring a sculptural silhouette and solid brass legs. Designed for corner placements that demand presence.",
        price: 189900,
        images: [
            "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200",
        ],
        modelUrl: `${BASE_URL}/models/sofa_velvet.glb`,
        stockQuantity: 12,
        status: "published" as const,
        isFeatured: true,
        tags: ["chair", "velvet", "accent", "ar", "premium"],
        categoryName: "Seating",
    },
    {
        name: "Damask Dining Chair",
        description: "Heritage damask fabric over a gold-leafed frame — this dining chair brings old-world craft to contemporary interiors. Sold as a pair.",
        price: 149900,
        images: [
            "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200",
        ],
        modelUrl: `${BASE_URL}/models/chair_damask.glb`,
        stockQuantity: 8,
        status: "published" as const,
        isFeatured: true,
        tags: ["chair", "dining", "gold", "ar", "heritage"],
        categoryName: "Seating",
    },
    {
        name: "Arc Floor Lamp",
        description: "A statement arc lamp in brushed bronze finish with a hand-spun linen shade. Casts warm, diffused light across a 2-metre arc. Dimmable.",
        price: 89900,
        images: [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1513506003901-1e6a35b98687?auto=format&fit=crop&q=80&w=1200",
        ],
        modelUrl: `${BASE_URL}/models/floor_lamp.glb`,
        stockQuantity: 20,
        status: "published" as const,
        isFeatured: false,
        tags: ["lamp", "lighting", "bronze", "ar", "arc"],
        categoryName: "Lighting",
    },
];

async function main() {
    console.log("Seeding AR test products...");

    try {
        for (const p of AR_PRODUCTS) {
            // Skip if product with this name and modelUrl already exists
            const existing = await prisma.product.findFirst({
                where: { name: p.name, modelUrl: p.modelUrl },
                select: { id: true },
            });
            if (existing) {
                console.log(`  ⏭  Skipping existing: "${p.name}"`);
                continue;
            }

            // Find or create category
            const slug = p.categoryName.toLowerCase().replace(/\s+/g, "-");
            let category = await prisma.category.findFirst({ where: { name: p.categoryName } });
            if (!category) {
                category = await prisma.category.create({
                    data: { name: p.categoryName, slug },
                });
                console.log(`  Created category: ${p.categoryName}`);
            }

            const product = await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    images: p.images,
                    modelUrl: p.modelUrl,
                    stockQuantity: p.stockQuantity,
                    status: p.status,
                    isFeatured: p.isFeatured,
                    tags: p.tags,
                    // mainCategory uses enum: MEN | WOMEN | KIDS — omit to use default (MEN)
                    categories: { connect: { id: category.id } },
                },
            });
            console.log(`  ✔ Created: "${product.name}" — ${product.modelUrl}`);
        }
        console.log(`\n✅ Done.`);
    } catch (e) {
        console.error("Seeding error:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

// @ts-nocheck
/**
 * Seed: Vault / Premium Collection products
 * Run: npx tsx seed_vault_products.ts
 */
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

const VAULT_PRODUCTS = [
    {
        name: "Onyx Lounge Sofa",
        description: "Hand-stitched full-grain leather over an ebonised oak frame. Each piece is individually numbered. Limited to 24 units worldwide.",
        price: 649900,
        images: [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200",
        ],
        isFeatured: true,
        tags: ["sofa", "leather", "premium", "rare", "limited"],
        categoryName: "Seating",
    },
    {
        name: "Atelier Writing Desk",
        description: "Solid white marble top inlaid into a hand-welded brass base. Each slab is sourced from the Carrara quarry — no two are identical.",
        price: 429900,
        images: [
            "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200",
        ],
        isFeatured: true,
        tags: ["desk", "marble", "premium", "rare"],
        categoryName: "Storage & Tables",
    },
    {
        name: "Édition Noir Bed Frame",
        description: "A platform bed frame in lacquered Macassar ebony with hand-forged iron hardware. Mattress size: super king. Assembly included.",
        price: 589900,
        images: [
            "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=1200",
        ],
        isFeatured: true,
        tags: ["bed", "ebony", "premium", "rare", "limited"],
        categoryName: "Bedroom",
    },
    {
        name: "Aethelon Grand Armchair",
        description: "Deep-buttoned velvet upholstery on a solid walnut frame, inspired by Parisian gentlemen's clubs. Available in midnight blue and cognac.",
        price: 289900,
        images: [
            "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200",
        ],
        isFeatured: true,
        tags: ["armchair", "velvet", "premium", "walnut"],
        categoryName: "Seating",
    },
    {
        name: "Totem Floor Cabinet",
        description: "A sculptural five-door cabinet in wenge and polished stainless. Designed as both storage and statement art. Bespoke sizing on request.",
        price: 519900,
        images: [
            "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1200",
        ],
        isFeatured: true,
        tags: ["cabinet", "storage", "premium", "rare", "wenge"],
        categoryName: "Storage & Tables",
    },
    {
        name: "Lune Side Table (Set of 2)",
        description: "Two crescent-form tables in white Corian on mirror-polished stainless bases. Nest together or float separately as accent pieces.",
        price: 159900,
        images: [
            "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1200",
        ],
        isFeatured: false,
        tags: ["table", "corian", "premium", "side-table"],
        categoryName: "Storage & Tables",
    },
];

async function main() {
    console.log("Seeding Vault / Premium products...");
    try {
        for (const p of VAULT_PRODUCTS) {
            // Skip if already exists
            const existing = await prisma.product.findFirst({
                where: { name: p.name },
                select: { id: true },
            });
            if (existing) {
                console.log(`  ⏭  Skipping existing: "${p.name}"`);
                continue;
            }

            // Find or create category
            const slug = p.categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
                    stockQuantity: Math.floor(Math.random() * 15) + 5,
                    status: "published",
                    isFeatured: p.isFeatured,
                    tags: p.tags,
                    categories: { connect: { id: category.id } },
                },
            });
            console.log(`  ✔ "${product.name}" — £${(product.price / 100).toFixed(0)}`);
        }
        console.log(`\n✅ Vault products seeded.`);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

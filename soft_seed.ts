// @ts-nocheck
import { PrismaClient } from "@prisma/client";

// Hardcoded for verification only - delete after use
const DATABASE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza196UGJua3ZYMjN6c0ZXOGdJYk1iSHciLCJhcGlfa2V5IjoiMDFLRjYzVFRaQk1TNThWNFozVktZMVNXQzUiLCJ0ZW5hbnRfaWQiOiI5NThhZDU4NThmOWQ1MGIwOWQxYTM1Mjc1ZmU1NTdhYjg2NzEyOTUxNWFhNmRlZmY5NTJlMThmYjY3NDJkNzVhIiwiaW50ZXJuYWxfc2VjcmV0IjoiMTkzYmJkMzEtNGViMS00MWExLTgwZTUtYTBmMWEzOWExMGUxIn0.txXDqLIka8Q24nM5WrkO9PiRyX8TFjMB6HMgE34qEpw&connect_timeout=60";

const ASSETS = {
    chronoFront: "/assets/products/velorum_chrono_front_black.png",
    chronoAngle: "/assets/products/velorum_chrono_angle_black.png",
    chronoGold: "/assets/products/velorum_chrono_gold_black.png",
    aviator: "/assets/products/velorum_aviator_green.png",
    horizon: "/assets/products/velorum_horizon_titanium.png",
    perpetual: "/assets/products/velorum_perpetual_gold.png",
    legacy: "/assets/products/velorum_legacy_classic.png",
    concept: "/assets/products/velorum_concept_digital.png",
    regatta: "/assets/products/velorum_regatta_yacht.png",
    stealth: "/assets/products/velorum_stealth_black.png",
};

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

function pickOne<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log("Starting Manual Seed...");

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: DATABASE_URL
            }
        }
    });

    try {
        // 1. Upsert Categories
        const categoriesData = [
            { name: "Chronographs", image: ASSETS.chronoFront },
            { name: "Aviation", image: ASSETS.aviator },
            { name: "Diving", image: ASSETS.regatta },
            { name: "Dress", image: ASSETS.legacy },
            { name: "Grand Complications", image: ASSETS.perpetual },
            { name: "Concept", image: ASSETS.concept },
        ];

        const catMap: Record<string, string> = {};
        for (const c of categoriesData) {
            const cat = await prisma.category.upsert({
                where: { name: c.name },
                update: { image: c.image },
                create: { name: c.name, slug: slugify(c.name), image: c.image }
            });
            catMap[c.name] = cat.id;
        }

        // 2. Upsert Products
        const productsData = [
            { name: "Velorum Chronograph Steel", price: 8900, cat: "Chronographs", img: [ASSETS.chronoFront, ASSETS.chronoAngle], desc: "The quintessential tool watch.", feat: true },
            { name: "Velorum Chronograph Gold", price: 18500, cat: "Chronographs", img: [ASSETS.chronoGold, ASSETS.chronoAngle], desc: "A statement of elegance.", feat: false },
            { name: "Velorum Regatta Master", price: 12400, cat: "Diving", img: [ASSETS.regatta], desc: "Precision yachting timer.", feat: true },
            { name: "Velorum Aviator Mk II", price: 6500, cat: "Aviation", img: [ASSETS.aviator], desc: "Vintage inspired pilot's watch.", feat: false },
            { name: "Velorum Horizon Titanium", price: 7200, cat: "Aviation", img: [ASSETS.horizon], desc: "Modern field watch.", feat: false },
            { name: "Velorum Leagcy Automatic", price: 5400, cat: "Dress", img: [ASSETS.legacy], desc: "Pure minimalism.", feat: false },
            { name: "Velorum Perpetual Calendar", price: 45000, cat: "Grand Complications", img: [ASSETS.perpetual], desc: "The pinnacle of horology.", feat: true },
            { name: "Velorum Concept One", price: 28000, cat: "Concept", img: [ASSETS.concept], desc: "Avant-garde.", feat: true },
            { name: "Velorum Stealth Ops", price: 9800, cat: "Concept", img: [ASSETS.stealth], desc: "Full DLC black coating.", feat: false },
            { name: "Velorum Deep Sea", price: 7200, cat: "Diving", img: [ASSETS.chronoAngle], desc: "Professional diver.", feat: false },
        ];

        const productMap = [];
        for (const p of productsData) {
            const product = await prisma.product.upsert({
                where: { name: p.name },
                update: {
                    price: p.price,
                    description: p.desc,
                    images: p.img,
                    isFeatured: p.feat,
                    stockQuantity: 10
                },
                create: {
                    name: p.name,
                    description: p.desc,
                    price: p.price,
                    status: "published",
                    isFeatured: p.feat,
                    categoryId: catMap[p.cat],
                    mainCategory: "MEN",
                    stockQuantity: 10,
                    images: p.img,
                    color: "Silver",
                    style: p.cat,
                    tags: ["Luxury", p.cat],
                }
            });
            productMap.push(product);
        }
        console.log(`Upserted ${productsData.length} products.`);

        // 3. Upsert User
        const targetEmail = "alihassan182006@gmail.com";
        const user = await prisma.user.upsert({
            where: { email: targetEmail },
            update: { isAdmin: true },
            create: {
                id: "user_ali_hassan_123",
                email: targetEmail,
                firstName: "Ali", lastName: "Hassan",
                isAdmin: true,
                profileImage: "https://placehold.co/200x200/png?text=AH"
            }
        });

        // 4. Generate Orders for Analytics
        const orderCount = await prisma.order.count({ where: { userId: user.id } });
        if (orderCount < 5) {
            console.log("Generating fresh orders...");
            const today = new Date();
            for (let i = 0; i < 15; i++) {
                const daysAgo = Math.floor(Math.random() * 30);
                const orderDate = new Date(today);
                orderDate.setDate(today.getDate() - daysAgo);

                const p = pickOne(productMap);
                const status = daysAgo > 5 ? "delivered" : pickOne(["processing", "shipped"]);

                await prisma.order.create({
                    data: {
                        userId: user.id,
                        status: status,
                        amount: p.price * 100,
                        createdAt: orderDate,
                        shippingName: "Ali Hassan",
                        shippingStreet1: "123 Palm Jumeirah",
                        orderItems: {
                            create: [{
                                productId: p.id,
                                name: p.name,
                                price: p.price,
                                quantity: 1,
                                image: p.images[0]
                            }]
                        }
                    }
                });
            }
            console.log("Orders generated.");
        } else {
            console.log("User already has orders.");
        }

        console.log("Manual Seed Complete.");

    } catch (e) {
        console.error("Manual Seed Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

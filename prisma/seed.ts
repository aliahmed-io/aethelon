
import { PrismaClient, MainCategory, ProductStatus, OrderStatus } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from "dotenv";
import path from "path";

// Explicitly load .env.local from the current working directory
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

const ASSETS = {
    chronoFront: "/assets/products/chrono_front_black.png",
    chronoAngle: "/assets/products/chrono_angle_black.png",
    chronoGold: "/assets/products/chrono_gold_black.png",
    aviator: "/assets/products/aviator_green.png",
    horizon: "/assets/products/horizon_titanium.png",
    perpetual: "/assets/products/perpetual_gold.png",
    legacy: "/assets/products/legacy_classic.png",
    concept: "/assets/products/concept_digital.png",
    regatta: "/assets/products/regatta_yacht.png",
    stealth: "/assets/products/stealth_black.png",
    deepSea: "/assets/products/deep_sea.png",
    goldLeather: "/assets/products/gold_leather.png",
};

function slugify(value: string): string {
    return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

function pickOne<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

interface ProductSeedData {
    name: string;
    price: number;
    cat: string;
    img: string[];
    desc: string;
    feat: boolean;
    modelUrl?: string;
}

interface CategorySeedData {
    name: string;
    image: string;
}

async function main() {
    console.log(`[Seed] Loading env from: ${envPath}`);
    // Ensure DATABASE_URL is set
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("[Seed] Error: DATABASE_URL not found in .env.local or environment.");
        process.exit(1);
    }

    console.log("[Seed] Connecting to database (Accelerate)...");

    // Initialize with accelerate options to match generated client expectations
    const prisma = new PrismaClient({
        log: ['warn', 'error'],
        accelerateUrl: connectionString,
    } as any).$extends(withAccelerate());

    try {
        console.log("[Seed] Upserting Categories...");
        const categoriesData: CategorySeedData[] = [
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

        console.log("[Seed] Upserting user 'alihassan182006@gmail.com'...");
        const targetEmail = "alihassan182006@gmail.com";
        // 'email' is not unique in Schema, so we use findFirst + conditional logic
        let user = await prisma.user.findFirst({ where: { email: targetEmail } });

        const userData = {
            id: "user_ali_hassan_123",
            email: targetEmail,
            firstName: "Ali",
            lastName: "Hassan",
            profileImage: "https://placehold.co/200x200/png?text=AH"
        };

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    profileImage: userData.profileImage
                }
            });
        } else {
            user = await prisma.user.create({
                data: userData
            });
        }

        // Ensure Address
        await prisma.address.createMany({
            data: [{
                userId: user.id,
                name: "Ali Hassan",
                street1: "123 Palm Jumeirah",
                city: "Dubai",
                state: "Dubai",
                country: "AE",
                postalCode: "00000",
                isDefault: true
            }],
            skipDuplicates: true
        });

        console.log("[Seed] Upserting 10 Premium Products...");
        const productsData: ProductSeedData[] = [
            { name: "Aethelon Chronograph Steel", price: 8900, cat: "Chronographs", img: [ASSETS.chronoFront, ASSETS.chronoAngle], desc: "The quintessential tool watch. Brushed 316L stainless steel case.", feat: true },
            { name: "Aethelon Chronograph Gold", price: 18500, cat: "Chronographs", img: [ASSETS.chronoGold, ASSETS.chronoAngle], desc: "A statement of elegance. 18k Rose Gold case.", feat: false },
            { name: "Aethelon Regatta Master", price: 12400, cat: "Diving", img: [ASSETS.regatta], desc: "Precision yachting timer with countdown complication.", feat: true },
            { name: "Aethelon Aviator Mk II", price: 6500, cat: "Aviation", img: [ASSETS.aviator], desc: "Vintage inspired pilot's watch with bronze case.", feat: false },
            { name: "Aethelon Horizon Titanium", price: 7200, cat: "Aviation", img: [ASSETS.horizon], desc: "Modern field watch. Grade 5 titanium.", feat: false },
            { name: "Aethelon Leagcy Automatic", price: 5400, cat: "Dress", img: [ASSETS.legacy], desc: "Pure minimalism. Porcelain dial.", feat: false },
            { name: "Aethelon Perpetual Calendar", price: 45000, cat: "Grand Complications", img: [ASSETS.perpetual], desc: "The pinnacle of horology. Moonphase.", feat: true },
            { name: "Aethelon Concept One", price: 28000, cat: "Concept", img: [ASSETS.concept], desc: "Avant-garde digital-mechanical hybrid.", feat: true },
            { name: "Aethelon Stealth Ops", price: 9800, cat: "Concept", img: [ASSETS.stealth], desc: "Full DLC black coating. Phantom hands.", feat: false },
            { name: "Aethelon Deep Sea", price: 7200, cat: "Diving", img: [ASSETS.deepSea], desc: "Professional diver. Helium escape valve.", feat: false },
            { name: "Aethelon Heritage Gold", price: 14500, cat: "Chronographs", img: [ASSETS.goldLeather], desc: "Timeless elegance with a cream sunburst dial and genuine alligator leather strap. 18k Gold case.", feat: true, modelUrl: "/assets/models/gold_leather.glb" },
        ];

        const productMap: { id: string; name: string; price: number; images: string[] }[] = [];
        for (const p of productsData) {
            const existing = await prisma.product.findFirst({ where: { name: p.name } });

            let product;
            const productData = {
                name: p.name,
                description: p.desc,
                price: p.price,
                status: ProductStatus.published,
                isFeatured: p.feat,
                categoryId: catMap[p.cat],
                mainCategory: MainCategory.MEN,
                stockQuantity: 10,
                images: p.img,
                modelUrl: p.modelUrl,
                color: "Silver",
                style: p.cat,
                tags: ["Luxury", p.cat],
            };

            if (existing) {
                product = await prisma.product.update({
                    where: { id: existing.id },
                    data: {
                        ...productData,
                        stockQuantity: 10
                    }
                });
            } else {
                product = await prisma.product.create({
                    data: productData
                });
            }
            productMap.push(product);
        }

        // Wishlist
        const wP = [productMap[6], productMap[7]];
        for (const p of wP) {
            const exists = await prisma.wishlistItem.findFirst({ where: { userId: user.id, productId: p.id } });
            if (!exists) await prisma.wishlistItem.create({ data: { userId: user.id, productId: p.id } });
        }

        // Create additional sample users for "Active Users" stat
        console.log("[Seed] Creating additional sample users...");
        const sampleUsers = [
            { id: "user_sample_1", email: "james.wilson@example.com", firstName: "James", lastName: "Wilson", profileImage: "https://placehold.co/200x200/png?text=JW" },
            { id: "user_sample_2", email: "sophia.chen@example.com", firstName: "Sophia", lastName: "Chen", profileImage: "https://placehold.co/200x200/png?text=SC" },
            { id: "user_sample_3", email: "marcus.berg@example.com", firstName: "Marcus", lastName: "Berg", profileImage: "https://placehold.co/200x200/png?text=MB" },
        ];

        const allUsers = [user];
        for (const su of sampleUsers) {
            let existingUser = await prisma.user.findFirst({ where: { email: su.email } });
            if (!existingUser) {
                existingUser = await prisma.user.create({ data: su });
            }
            allUsers.push(existingUser);
        }

        console.log("[Seed] Generating Order History (60 Days)...");
        const totalOrderCount = await prisma.order.count();
        if (totalOrderCount < 20) {
            const today = new Date();
            // Generate 40 orders spread across 60 days for better chart visualization
            for (let i = 0; i < 40; i++) {
                const daysAgo = Math.floor(Math.random() * 60);
                const orderDate = new Date(today);
                orderDate.setDate(today.getDate() - daysAgo);

                const orderUser = pickOne(allUsers);
                const p = pickOne(productMap);
                const status = daysAgo > 7 ? OrderStatus.DELIVERED : pickOne([OrderStatus.CREATED, OrderStatus.SHIPPED]);

                await prisma.order.create({
                    data: {
                        userId: orderUser.id,
                        status: status,
                        amount: p.price * 100,
                        createdAt: orderDate,
                        shippingName: `${orderUser.firstName} ${orderUser.lastName}`,
                        shippingStreet1: "123 Sample Street",
                        shippingCity: pickOne(["Dubai", "London", "New York", "Tokyo", "Paris"]),
                        shippingCountry: pickOne(["AE", "GB", "US", "JP", "FR"]),
                        shippingPostalCode: "00000",
                        orderItems: {
                            create: [{
                                productId: p.id,
                                name: p.name,
                                price: p.price,
                                quantity: Math.floor(Math.random() * 2) + 1,
                                image: p.images[0]
                            }]
                        }
                    }
                });
            }
            console.log("[Seed] Created 40 new historical orders across 60 days.");
        } else {
            console.log("[Seed] Sufficient order history exists.");
        }

        // Seed Newsletter Subscribers
        console.log("[Seed] Seeding Newsletter Subscribers...");
        const newsletterEmails = [
            "luxury.collector@gmail.com",
            "watch.enthusiast@outlook.com",
            "horology.fan@yahoo.com",
            "timepiece.lover@icloud.com",
            "swiss.watches@proton.me",
        ];

        for (const email of newsletterEmails) {
            await prisma.newsletterSubscriber.upsert({
                where: { email },
                update: {},
                create: { email }
            });
        }

        console.log("[Seed] Seeding Campaign Assets (Banners & Featured)...");
        // 1. Banner
        await prisma.banner.create({
            data: {
                title: "The Aviator 2026",
                imageString: "/assets/generated/banner.png",
                link: "/shop",
            }
        });

        // 2. Products
        const campaignProducts = [
            {
                name: "Aethelon Deep Dive",
                description: "Professional diver watch, 500m water resistance. Ceramic bezel.",
                price: 12500,
                images: ["/assets/generated/diver.png"],
                cat: "Diving",
                isFeatured: true
            },
            {
                name: "Aethelon Carbon Pilot",
                description: "Ultra-lightweight carbon fiber pilot watch. Chronometer certified.",
                price: 18900,
                images: ["/assets/generated/carbon.png"],
                cat: "Aviation",
                isFeatured: true
            }
        ];

        for (const cp of campaignProducts) {
            const existing = await prisma.product.findFirst({ where: { name: cp.name } });
            if (!existing) {
                await prisma.product.create({
                    data: {
                        name: cp.name,
                        description: cp.description,
                        price: cp.price,
                        images: cp.images,
                        categoryId: catMap[cp.cat] || catMap["Chronographs"], // Fallback if cat missing
                        status: ProductStatus.published,
                        isFeatured: cp.isFeatured,
                        stockQuantity: 5,
                        mainCategory: MainCategory.MEN,
                        color: "Black",
                        style: cp.cat,
                        tags: ["Campaign", "Luxury"]
                    }
                });
            }
        }

        console.log("Aethelon Seeding Successfully Completed.");

    } catch (e) {
        console.error("[Seed] Error:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

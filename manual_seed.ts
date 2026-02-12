// @ts-nocheck
import { PrismaClient } from "@prisma/client";

// Hardcoded for verification only - delete after use
// Hardcoded for verification only - delete after use
const DATABASE_URL = process.env.DATABASE_URL;

const ASSETS = {
    sofaVelvet: "/assets/products/sofa_velvet_blue.png",
    armchairLeather: "/assets/products/armchair_leather_tan.png",
    diningTable: "/assets/products/dining_table_oak.png",
    coffeeTable: "/assets/products/coffee_table_marble.png",
    bedFrame: "/assets/products/bed_frame_walnut.png",
    bookshelf: "/assets/products/bookshelf_industrial.png",
    lampFloor: "/assets/products/lamp_floor_brass.png",
    rugPersian: "/assets/products/rug_persian_red.png",
    deskOffice: "/assets/products/desk_office_modern.png",
    chairDining: "/assets/products/chair_dining_scandi.png",
};

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

function pickOne<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log("Starting Manual Seed (Furniture Edition)...");

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
            { name: "Living Room", image: ASSETS.sofaVelvet },
            { name: "Dining Room", image: ASSETS.diningTable },
            { name: "Bedroom", image: ASSETS.bedFrame },
            { name: "Home Office", image: ASSETS.deskOffice },
            { name: "Lighting", image: ASSETS.lampFloor },
            { name: "Decor", image: ASSETS.rugPersian },
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
            { name: "Aethelon Velvet Sofa", price: 2400, cat: "Living Room", img: [ASSETS.sofaVelvet], desc: "Luxurious deep blue velvet sofa with brass legs.", feat: true, color: "Blue", style: "Modern" },
            { name: "Aethelon Leather Armchair", price: 1200, cat: "Living Room", img: [ASSETS.armchairLeather], desc: "Cognac leather armchair, mid-century design.", feat: false, color: "Tan", style: "Mid-Century" },
            { name: "Aethelon Oak Dining Table", price: 3500, cat: "Dining Room", img: [ASSETS.diningTable], desc: "Solid oak table, seats 8.", feat: true, color: "Oak", style: "Scandinavian" },
            { name: "Aethelon Marble Coffee Table", price: 850, cat: "Living Room", img: [ASSETS.coffeeTable], desc: "Carrara marble top with minimal steel base.", feat: false, color: "White", style: "Modern" },
            { name: "Aethelon Walnut Bed Frame", price: 1800, cat: "Bedroom", img: [ASSETS.bedFrame], desc: "Platform bed with integrated headboard storage.", feat: true, color: "Walnut", style: "Contemporary" },
            { name: "Aethelon Industrial Bookshelf", price: 950, cat: "Home Office", img: [ASSETS.bookshelf], desc: "Steel and reclaimed wood shelving unit.", feat: false, color: "Black/Wood", style: "Industrial" },
            { name: "Aethelon Brass Floor Lamp", price: 450, cat: "Lighting", img: [ASSETS.lampFloor], desc: "Art deco inspired floor lamp.", feat: false, color: "Gold", style: "Art Deco" },
            { name: "Aethelon Persian Rug", price: 1500, cat: "Decor", img: [ASSETS.rugPersian], desc: "Hand-knotted wool rug, vintage wash.", feat: true, color: "Red/Cream", style: "Traditional" },
            { name: "Aethelon Executive Desk", price: 2100, cat: "Home Office", img: [ASSETS.deskOffice], desc: "Minimalist desk with cable management.", feat: true, color: "Black", style: "Modern" },
            { name: "Aethelon Scandi Chair", price: 350, cat: "Dining Room", img: [ASSETS.chairDining], desc: "Curved wood dining chair.", feat: false, color: "Ash", style: "Scandinavian" },
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
                    stockQuantity: 10,
                    color: p.color,
                    style: p.style
                },
                create: {
                    name: p.name,
                    description: p.desc,
                    price: p.price,
                    status: "published",
                    isFeatured: p.feat,
                    categoryId: catMap[p.cat],
                    mainCategory: "MEN", // Retain enum or update schema later if needed, assuming "MEN" is default for now but semantically wrong.
                    // Ideally we fix MainCategory enum to be FURNITURE specific or generic.
                    // For now, forcing a valid enum value to avoid breakage.
                    stockQuantity: 10,
                    images: p.img,
                    color: p.color,
                    style: p.style,
                    tags: ["Furniture", p.style, p.cat],
                }
            });
            productMap.push(product);
        }
        console.log(`Upserted ${productsData.length} furniture products.`);

        // 3. Upsert User
        const targetEmail = "alihassan182006@gmail.com";
        const user = await prisma.user.upsert({
            where: { email: targetEmail },
            update: { role: "ADMIN" }, // Use role enum
            create: {
                id: "user_ali_hassan_123",
                email: targetEmail,
                firstName: "Ali", lastName: "Hassan",
                role: "ADMIN",
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
                const status = daysAgo > 5 ? "DELIVERED" : pickOne(["CREATED", "SHIPPED"]); // Use correct OrderStatus enum

                await prisma.order.create({
                    data: {
                        userId: user.id,
                        status: status as any,
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

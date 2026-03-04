import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    console.log('── Provisioning Dashboard Analytics Seed Data ──');

    // 1. Fetch some real products to assign to orders
    const products = await prisma.product.findMany({ take: 5 });
    if (products.length === 0) {
        console.error('❌ No products found. Run seed_landing_models.ts first.');
        process.exit(1);
    }

    // 2. Create Faux Users for Orders
    const users = [
        { id: 'usr_demo1', email: 'investor_alpha@aethelon.demo', firstName: 'Julian', lastName: 'Pierce' },
        { id: 'usr_demo2', email: 'architect_b@aethelon.demo', firstName: 'Sarah', lastName: 'Chen' },
        { id: 'usr_demo3', email: 'buyer_c@aethelon.demo', firstName: 'Marcus', lastName: 'Anton' },
    ];

    for (const usr of users) {
        await prisma.user.upsert({
            where: { id: usr.id },
            update: {},
            create: {
                id: usr.id,
                email: usr.email,
                firstName: usr.firstName,
                lastName: usr.lastName,
                profileImage: `https://avatar.vercel.sh/${usr.id}`
            }
        });
    }
    console.log(`✅ Seeded ${users.length} Faux Customers`);

    // 3. Generate 30 Days of Historic Orders
    // 3. Generate 30 Days of Historic Orders
    let totalRevenue = 0;
    const orderStatuses = ['PAYMENT_PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

    // Clear old demo orders to prevent infinite bloat
    await prisma.order.deleteMany().catch(() => { });

    console.log('Generating 45 historic orders...');
    for (let i = 0; i < 45; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Spread dates over the last 60 days
        const dateOffset = Math.floor(Math.random() * 60);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - dateOffset);

        // Weighted status (mostly delivered/shipped)
        const statusWeights = [3, 3, 2, 2, 0, 0, 0, 0, 1, 4];
        const status = orderStatuses[statusWeights[Math.floor(Math.random() * statusWeights.length)]];

        const amount = randomProduct.price * (Math.floor(Math.random() * 2) + 1); // 1 or 2 quantity
        if (status !== 'CANCELLED') totalRevenue += amount;

        // Prisma create
        // @ts-ignore dynamic status mapping
        await prisma.order.create({
            data: {
                status: status,
                amount: amount,
                userId: randomUser.id,
                createdAt: createdAt,
            }
        });
    }

    console.log(`✅ Projected simulated revenue cache: $${totalRevenue}`);

    // 4. Create Active Banners (Storefront CMS Demo)
    const existingBanners = await prisma.banner.count();
    if (existingBanners === 0) {
        await prisma.banner.create({
            data: {
                title: 'The Cinematic Collection',
                imageString: 'https://i.imgur.com/Q5wQzV8.png',
                link: '/shop',
                campaignId: null
            }
        });
        console.log('✅ Injected 1 Active CMS Banner');
    }

    console.log('── Dashboard Analytics Seed Complete ──');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

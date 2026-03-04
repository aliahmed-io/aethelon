import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Uses the initialized Next.js connection

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        if (url.searchParams.get('secret') !== 'aethelon_admin_seed') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('── Provisioning Dashboard Analytics Seed Data via API ──');

        const products = await prisma.product.findMany({ take: 5 });
        if (products.length === 0) return NextResponse.json({ error: 'No products found' }, { status: 400 });

        const users = [
            { id: 'usr_demo1', email: 'investor_alpha@aethelon.demo', firstName: 'Julian', lastName: 'Pierce' },
            { id: 'usr_demo2', email: 'architect_b@aethelon.demo', firstName: 'Sarah', lastName: 'Chen' },
            { id: 'usr_demo3', email: 'buyer_c@aethelon.demo', firstName: 'Marcus', lastName: 'Anton' },
        ];

        for (const usr of users) {
            const existing = await prisma.user.findUnique({ where: { id: usr.id } });
            if (!existing) {
                await prisma.user.create({
                    data: {
                        id: usr.id,
                        email: usr.email,
                        firstName: usr.firstName,
                        lastName: usr.lastName,
                        profileImage: `https://avatar.vercel.sh/${usr.id}`
                    }
                });
            }
        }

        let totalRevenue = 0;
        const orderStatuses = ['PAYMENT_PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

        await prisma.order.deleteMany().catch(() => { });

        for (let i = 0; i < 45; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomUser = users[Math.floor(Math.random() * users.length)];

            const dateOffset = Math.floor(Math.random() * 60);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - dateOffset);

            const statusWeights = [3, 3, 2, 2, 0, 0, 0, 0, 1, 4];
            const status = orderStatuses[statusWeights[Math.floor(Math.random() * statusWeights.length)]];
            const amount = randomProduct.price * (Math.floor(Math.random() * 2) + 1);

            if (status !== 'CANCELLED') totalRevenue += amount;

            await prisma.order.create({
                // @ts-ignore dynamic mapping
                data: { status, amount, userId: randomUser.id, createdAt }
            });
        }

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
        }

        return NextResponse.json({
            success: true,
            message: 'Dashboard Analytics Seed Complete',
            usersCount: users.length,
            ordersGenerated: 45,
            projectedRevenue: totalRevenue
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

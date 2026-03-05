import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import 'dotenv/config';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    await prisma.product.updateMany({
        where: { name: 'Atelier Writing Desk' },
        data: { modelUrl: null, usdzUrl: null }
    });
    console.log('Removed duplicate model from Writing Desk');
}

main().finally(() => prisma.$disconnect());

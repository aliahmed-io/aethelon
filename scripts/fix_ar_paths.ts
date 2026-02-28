import { PrismaClient } from '@prisma/client';
import { withAccelerate } from "@prisma/extension-accelerate";

require('dotenv').config();

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL
}).$extends(withAccelerate());

async function main() {
    console.log('🔄 Repairing 3D model paths in database...');

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { modelUrl: { contains: 'http://localhost:3000' } },
                { usdzUrl: { contains: 'http://localhost:3000' } },
                { modelUrl: { contains: 'https://aethelon.com' } },
                { usdzUrl: { contains: 'https://aethelon.com' } }
            ]
        }
    });

    console.log(`Found ${products.length} products with absolute URLs.`);

    for (const product of products) {
        const updates: any = {};
        if (product.modelUrl) {
            updates.modelUrl = product.modelUrl.replace(/https?:\/\/[^\/]+/, '');
        }
        if (product.usdzUrl) {
            updates.usdzUrl = product.usdzUrl.replace(/https?:\/\/[^\/]+/, '');
        }

        await prisma.product.update({
            where: { id: product.id },
            data: updates
        });
        console.log(`✅ Fixed: ${product.name}`);
    }

    console.log('✨ All paths are now relative.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

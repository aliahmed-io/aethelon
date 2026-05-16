import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import 'dotenv/config';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: {
                in: ['Obsidian Sculpted Console', 'Monochrome Swivel Chair']
            }
        },
        select: {
            id: true,
            name: true,
            modelUrl: true,
            usdzUrl: true
        }
    });

    console.log('Product Data:');
    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

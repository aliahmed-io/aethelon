import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: { in: ['Aethelon Perpetual', 'Aethelon Chronograph G'] }
        },
        select: { id: true, name: true, images: true }
    });
    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

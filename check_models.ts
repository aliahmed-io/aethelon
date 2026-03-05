import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import 'dotenv/config';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    const p = await prisma.product.findMany({ select: { name: true, modelUrl: true, id: true }, where: { modelUrl: { not: null } } });
    console.log(JSON.stringify(p, null, 2));
}

main().finally(() => prisma.$disconnect());

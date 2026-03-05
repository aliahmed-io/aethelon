import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import 'dotenv/config';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    await prisma.product.updateMany({
        where: { name: 'Velvet Accent Chair' },
        data: { modelUrl: '/models/sofa_velvet.glb', usdzUrl: '/models/sofa_velvet.usdz' }
    });
    console.log('Restored chair.');
}

main().finally(() => prisma.$disconnect());

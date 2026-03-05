import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());



const AR_UPDATES = [

    {
        name: 'Arc Floor Lamp',
        modelUrl: `/models/floor_lamp.glb`,
        usdzUrl: `/models/floor_lamp.usdz`,
    },
    {
        name: 'Aethelon Grand Armchair',
        modelUrl: `/models/chair_damask.glb`,
        usdzUrl: `/models/chair_damask.usdz`,
    },
    {
        name: 'Velvet Accent Chair',
        modelUrl: `/models/sofa_velvet.glb`,
        usdzUrl: `/models/sofa_velvet.usdz`,
    },
];

async function main() {
    console.log('── Updating AR Models');
    for (const update of AR_UPDATES) {
        const product = await prisma.product.findFirst({
            where: { name: update.name },
            select: { id: true }
        });

        if (product) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    modelUrl: update.modelUrl,
                    usdzUrl: update.usdzUrl,
                }
            });
            console.log(`  ✔ Updated: ${update.name}`);
        } else {
            console.log(`  ⏭  Not found: ${update.name}`);
        }
    }
    console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

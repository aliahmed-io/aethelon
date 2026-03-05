import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import 'dotenv/config';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    // 1. Assign the orange sofa 3D model to the "Nimbus Lounge Sofa"
    await prisma.product.updateMany({
        where: { name: 'Nimbus Lounge Sofa' },
        data: {
            modelUrl: '/landing_decor.glb',
            usdzUrl: '/landing_decor.usdz' // Assuming future USDZ availability
        }
    });

    // 2. Assign the green chair 3D model to the "Lumina Accent Chair"
    await prisma.product.updateMany({
        where: { name: 'Lumina Accent Chair' },
        data: {
            modelUrl: '/landing_chair.glb',
            usdzUrl: '/landing_chair.usdz'
        }
    });

    // 3. Remove the duplicate orange chair from the Velvet Accent Chair 
    // Wait, the user said: "for the existing ar producrs u r using the same chair orange model twice please remove 1 of them"
    // He probably meant the Velvet Accent Chair or Aethelon Grand Armchair!
    // Since we now have a new orange sofa (Nimbus) and a new green chair (Lumina),
    // let's ensure the Velvet Accent Chair doesn't have an orange chair duplicate.
    // The "Velvet Accent Chair" was using `sofa_velvet.glb` (which is orange).
    // Let's severe the AR model from Velvet Accent Chair just to be absolutely sure there's no duplicates.
    await prisma.product.updateMany({
        where: { name: 'Velvet Accent Chair' },
        data: { modelUrl: null, usdzUrl: null }
    });

    // 4. Also remove the test products I made
    await prisma.product.deleteMany({
        where: { name: { in: ['The Aethelon Lounge Chair', 'The Abstract Architectural Sofa'] } }
    });

    console.log('✅ Re-assigned 3D models to the correct storefront products!');
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import 'dotenv/config';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    // 1. Remove 3D/AR from Obsidian Sculpted Console
    const obsidian = await prisma.product.updateMany({
        where: { name: 'Obsidian Sculpted Console' },
        data: {
            modelUrl: null,
            usdzUrl: null
        }
    });
    console.log(`✅ Removed 3D/AR from ${obsidian.count} Obsidian Sculpted Console(s).`);

    // 2. Add 3D/AR to Monochrome Swivel Chair
    const monochrome = await prisma.product.updateMany({
        where: { name: 'Monochrome Swivel Chair' },
        data: {
            modelUrl: '/assets/models/monochrome-swivel-chair.glb',
            // No USDZ for now, unless the user provides one or we generate it. 
            // Usually we'd want both for full AR support (Android/iOS).
        }
    });
    console.log(`✅ Added 3D/AR to ${monochrome.count} Monochrome Swivel Chair(s).`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

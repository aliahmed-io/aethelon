import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
  console.log('Seeding the exact Cinematic 3D Models (Chair + Sofa) into the database...');

  const chair = await prisma.product.create({
    data: {
      name: 'The Aethelon Lounge Chair',
      description: 'The definitive silhouette from our interactive cinematic experience. A sweeping, low-profile lounge chair upholstered in premium dark bouclé. View it instantly in your room using the WebXR visualizer.',
      price: 3400,
      isVaultExclusive: false,
      status: 'published',
      images: ['/landing_chair.png'],
      modelUrl: '/landing_chair.glb',
    }
  })
  console.log('✅ Seeded Lounge Chair:', chair.id)

  const decor = await prisma.product.create({
    data: {
      name: 'The Abstract Architectural Sofa',
      description: 'The massive flowing sculptural sofa featured at the climax of the Aethelon cinematic tour. Featuring a radical asymmetric design intended for grand architectural spaces.',
      price: 8250,
      isVaultExclusive: true, // Making the massive sofa a Premium Vault exclusive
      status: 'published',
      images: ['/landing_decor.png'],
      modelUrl: '/landing_decor.glb',
    }
  })
  console.log('✅ Seeded Sculptural Sofa:', decor.id)

  console.log('Seeding transaction fully committed.')
}

main().catch(console.error).finally(() => prisma.$disconnect());

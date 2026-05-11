import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function fix() {
  await prisma.product.updateMany({
    where: { name: 'Ceramic Vase Set (3)' },
    data: { images: ['https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=1200'] }
  });
  console.log('Fixed Ceramic Vase Set (3)');
}

fix().catch(console.error).finally(() => prisma.$disconnect());

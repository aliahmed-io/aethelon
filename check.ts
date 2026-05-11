import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function check() {
  const products = await prisma.product.findMany();
  console.log("Found products:");
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name, 
    description: p.description,
    images: p.images
  })), null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());

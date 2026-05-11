import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import * as fs from 'fs/promises';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function backup() {
  const products = await prisma.product.findMany();
  await fs.writeFile('products_backup.json', JSON.stringify(products, null, 2));
  console.log(`Successfully backed up ${products.length} products to products_backup.json`);
}

backup().catch(console.error).finally(() => prisma.$disconnect());

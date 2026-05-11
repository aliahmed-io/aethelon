import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
  const vaultProducts = await prisma.product.findMany({ where: { isVaultExclusive: true } });
  console.log(JSON.stringify(vaultProducts.map(p => ({ id: p.id, name: p.name })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

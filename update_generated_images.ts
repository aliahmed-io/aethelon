import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function updateDB() {
  await prisma.product.updateMany({ where: { name: 'Velvet Tuxedo Sofa' }, data: { images: ['/products/velvet_tuxedo_sofa.png'] } });
  await prisma.product.updateMany({ where: { name: 'Marble Coffee Table' }, data: { images: ['/products/marble_coffee_table.png'] } });
  await prisma.product.updateMany({ where: { name: 'Reclaimed Oak Dining Table' }, data: { images: ['/products/oak_dining_table.png'] } });
  await prisma.product.updateMany({ where: { name: 'Haven Platform Bed' }, data: { images: ['/products/haven_platform_bed.png'] } });
  await prisma.product.updateMany({ where: { name: 'Arc Floor Lamp' }, data: { images: ['/products/arc_floor_lamp.png'] } });
  console.log('Successfully updated the database with generated images.');
}

updateDB().catch(console.error).finally(() => prisma.$disconnect());

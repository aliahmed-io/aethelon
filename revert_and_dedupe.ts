import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import * as fs from 'fs';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

const fallbacks: Record<string, string[]> = {
  "Brushed Brass Bar Stool": ["https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&q=80&w=1200"],
  "Haven Platform Bed": ["https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&q=80&w=1200"],
  "Aethelon Grand Armchair": ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1200"],
  "Velvet Accent Chair": ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200"],
};

async function revertAndDedupe() {
  const data = JSON.parse(fs.readFileSync('products_backup.json', 'utf8'));
  const seenImages = new Set<string>();

  for (const product of data) {
    let uniqueImages = product.images.filter((img: string) => !seenImages.has(img));
    
    uniqueImages.forEach((img: string) => seenImages.add(img));

    if (uniqueImages.length === 0 && fallbacks[product.name]) {
      uniqueImages = fallbacks[product.name];
    }

    if (uniqueImages.length === 0) {
      console.warn(`Warning: Product ${product.name} ended up with zero images!`);
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { images: uniqueImages }
    });

    console.log(`Reverted and deduplicated: ${product.name} (${uniqueImages.length} images)`);
  }

  console.log("Successfully reverted to original images while eliminating duplicates.");
}

revertAndDedupe().catch(console.error).finally(() => prisma.$disconnect());

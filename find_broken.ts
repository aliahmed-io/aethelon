import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

function checkExternalUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

function checkLocalFile(localPath: string): boolean {
  const fullPath = path.join(process.cwd(), 'public', localPath);
  return fs.existsSync(fullPath);
}

async function findBrokenImages() {
  const products = await prisma.product.findMany();
  const brokenProducts = [];

  for (const product of products) {
    if (!product.images || product.images.length === 0) {
      brokenProducts.push({ name: product.name, description: product.description, reason: 'No images' });
      continue;
    }

    const img = product.images[0];
    let isOk = false;

    if (img.startsWith('http')) {
      isOk = await checkExternalUrl(img);
    } else {
      isOk = checkLocalFile(img);
    }

    if (!isOk) {
      brokenProducts.push({ name: product.name, description: product.description, img });
    }
  }

  console.log("Broken Products found:");
  console.log(JSON.stringify(brokenProducts, null, 2));
}

findBrokenImages().catch(console.error).finally(() => prisma.$disconnect());

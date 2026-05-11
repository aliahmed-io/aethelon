import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import * as https from 'https';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

// Pre-defined mapping for specific products based on the plan
const imageMapping: Record<string, string[]> = {
  "Nimbus Lounge Sofa": ["/variants/rust_sofa_1.png", "/variants/rust_sofa_2.png"],
  "Elysium Modern Lounge Chair": ["/products/modern-chair.webp"],
  "Cloud Modular Sofa": ["/variants/oatmeal_sofa.png"],
  "Modern Atelier Edition Sofa": ["/products/modern_sofa_1.png", "/products/modern_sofa_2.png"],
  "Velvet Tuxedo Sofa": ["/assets/products/sofa_velvet_blue.png"],
  "Onyx Lounge Sofa": ["/variants/charcoal_sofa.png"],
  "Lumina Accent Chair": ["/landing_chair.png"],
  "Mid-Century Accent Chair": ["/assets/products/armchair_leather_tan.png"],
  "Aethelon Grand Armchair": ["/variants/emerald_chair_1.png"],
  "Velvet Accent Chair": ["/variants/ochre_chair_1.png"],
  "Marble Coffee Table": ["/assets/products/coffee_table_marble.png"],
  "Reclaimed Oak Dining Table": ["/assets/products/dining_table_oak.png"],
  "Scandi Dining Chair": ["/assets/products/chair_dining_scandi.png"],
  "Atelier Writing Desk": ["/assets/products/desk_office_modern.png"],
  "Haven Platform Bed": ["/assets/products/bed_frame_walnut.png"],
  "Arc Floor Lamp": ["/assets/products/lamp_floor_brass.png"],
  "Persian-Style Wool Rug": ["/assets/products/rug_persian_red.png"],
  "Executive Architectural Office Chair": ["/products/office_chair_1.webp", "/products/office_chair_2.webp"],
  "Aero Dining Table": ["https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=1200"],
  "Brushed Brass Bar Stool": ["https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200"],
  "Linen Upholstered Bed": ["https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=1200"],
  "Édition Noir Bed Frame": ["https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200"],
  "Marble-Top Nightstand": ["https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=1200"],
  "ErgoPro Office Chair": ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1200"],
  "Ceramic Vase Set (3)": ["https://images.unsplash.com/photo-1613564175317-5353ee04d27a?auto=format&fit=crop&q=80&w=1200"],
  "Rattan Table Lamp": ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200"],
  "Arched Full-Length Mirror": ["https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200"],
  "Teak Garden Chair": ["https://images.unsplash.com/photo-1533044309907-0fa3413da946?auto=format&fit=crop&q=80&w=1200"],
  "Stone Outdoor Side Table": ["https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=1200"],
  "Blown Glass Pendant": ["https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=1200"],
};

// Helper function to verify an Unsplash URL returns a 200 OK
async function verifyUrl(url: string): Promise<boolean> {
  if (!url.startsWith('http')) return true; // Local assets are assumed to exist
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function updateImages() {
  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    if (imageMapping[product.name]) {
      const newImages = imageMapping[product.name];
      
      // Verify external images
      const verifiedImages = [];
      for (const imgUrl of newImages) {
        const isOk = await verifyUrl(imgUrl);
        if (isOk) {
          verifiedImages.push(imgUrl);
        } else {
          console.warn(`URL failed verification: ${imgUrl} for product ${product.name}`);
        }
      }

      if (verifiedImages.length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: verifiedImages }
        });
        console.log(`Updated images for: ${product.name}`);
        updatedCount++;
      } else {
        console.warn(`No verified images available for: ${product.name}. Skipping.`);
      }
    } else {
      console.warn(`No mapping found for: ${product.name}`);
    }
  }

  console.log(`Successfully updated ${updatedCount} products.`);
}

updateImages().catch(console.error).finally(() => prisma.$disconnect());

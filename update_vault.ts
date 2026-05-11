import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
  const updates = [
    {
      id: "5082a00d-2095-441d-ad80-767ad16ec197",
      name: "Twisted Oak Side Table",
      description: "A sculptural masterpiece crafted from solid oak. Its geometric, twisted pyramid silhouette brings an avant-garde organic feel to any modern living space.",
      images: ['/vault/vault p1 v1.png', '/vault/vault p1 v2.png', '/vault/vault p1 v3.png']
    },
    {
      id: "98c6ee2e-eb61-44b8-834a-4e90588b64b2",
      name: "Oblique Marquetry Cabinet",
      description: "A stunning tall armoire featuring an intricate, overlapping dark wood slat pattern. Accented with bespoke brass handles, it's a bold statement piece for the discerning collector.",
      images: ['/vault/vault p2 v1.png', '/vault/vault p2 v2.png', '/vault/vault p2 v3.png']
    },
    {
      id: "80afc969-ad7e-43e3-b355-0dfaa3c572dd",
      name: "Curved Bouclé Sofa",
      description: "Embrace softness and organic lines with this minimalist curved sofa. Upholstered in rich, textured brown bouclé, it offers unparalleled comfort and contemporary elegance.",
      images: ['/vault/vault p3 v1.png', '/vault/vault p3 v2.png', '/vault/vault p3 v3.png']
    },
    {
      id: "83e30d24-e70c-4fb4-901a-d98a729babc2",
      name: "Walnut S-Curve Bookshelf",
      description: "Mid-century modernism reimagined. This freestanding shelving unit features smooth, pillared walnut partitions and elegant curved edges, perfect for displaying curated artifacts.",
      images: ['/vault/vault p4 v1.png', '/vault/vault p4 v2.png', '/vault/vault p4 v3.png']
    },
    {
      id: "5f0ccc15-ba0c-424a-a61a-c7d3ff1be622",
      name: "Monochrome Swivel Chair",
      description: "A contemporary swivel chair featuring a dramatic, monolithic base and an enveloping curved back. Upholstered in a striking dark geometric pattern.",
      images: ['/vault/vault p5 v1.png', '/vault/vault p5 v2.png', '/vault/vault p5 v3.png']
    },
    {
      id: "c34dfd5d-6973-49cd-8601-ffb9a27ac7c5",
      name: "Oblique Marquetry Credenza",
      description: "Expanding on our oblique collection, this long, low-profile sideboard features the same overlapping dark wood motif and brass detailing, offering luxurious storage.",
      images: ['/vault/vault p6 v1.png', '/vault/vault p6 v2.png', '/vault/vault p6 v3.png']
    },
    {
      id: "19f7f8d2-b671-4e0c-a8d7-30ef1118fbc0",
      name: "Obsidian Sculpted Console",
      description: "An avant-garde functional art piece. This console table mimics raw, carved obsidian rock, bringing a dramatic, brutalist edge to an entryway or gallery space.",
      images: ['/vault/vault p7 v1.png', '/vault/vault p7 v2.png', '/vault/vault p7 v3.png']
    },
    {
      id: "63231770-5604-4a3d-a22f-8f115468c2cf",
      name: "Ribbed Velvet Lounge Chair",
      description: "Sink into luxury with this deep-seated lounge chair. Featuring exquisite ribbed dark velvet upholstery and a sleek swivel base, it merges retro aesthetics with modern comfort.",
      images: ['/vault/vault p8 v1.png', '/vault/vault p8 v2.png', '/vault/vault p8 v3.png']
    }
  ];

  for (const update of updates) {
    await prisma.product.update({
      where: { id: update.id },
      data: {
        name: update.name,
        description: update.description,
        images: update.images
      }
    });
    console.log(`Updated product ${update.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

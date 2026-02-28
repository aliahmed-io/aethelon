import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

require('dotenv').config();

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL
}).$extends(withAccelerate());

async function main() {
    const products = await prisma.product.findMany({
        where: { NOT: { modelUrl: null } },
        select: { id: true, name: true, modelUrl: true, usdzUrl: true },
        take: 5
    });
    console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(async () => {
    // wait a moment before disconnecting to ensure logs print
    await new Promise(r => setTimeout(r, 100));
    process.exit(0);
});

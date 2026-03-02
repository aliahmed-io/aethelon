import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

async function run() {
    try {
        console.log("Connecting to DB...");
        const count = await prisma.product.count();
        console.log("Total products:", count);
    } catch (e) {
        console.error(e);
    }
}
run();

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
    console.log('Testing connection...');
    const count = await prisma.product.count();
    console.log(`Connection successful. Product count: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

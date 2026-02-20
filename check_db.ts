
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const result = dotenv.config({ path: envPath });

console.log(`[Debug] Loading .env from: ${envPath}`);
if (result.error) {
    console.error(`[Debug] dotenv error:`, result.error);
}

console.log(`[Debug] DATABASE_URL defined: ${!!process.env.DATABASE_URL}`);

const prisma = new PrismaClient();

async function main() {
    try {
        const productCount = await prisma.product.count();
        console.log(`[Success] Product Count: ${productCount}`);

        const blogCount = await prisma.blogPost.count();
        console.log(`[Success] Blog Post Count: ${blogCount}`);

        const posts = await prisma.blogPost.findMany({ select: { slug: true } });
        console.log(`[Success] Blog Slugs:`, posts.map(p => p.slug));

        if (posts.length > 0) {
            const firstPost = await prisma.blogPost.findUnique({
                where: { slug: posts[0].slug }
            });
            console.log(`[Success] Found Blog: ${firstPost?.title}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

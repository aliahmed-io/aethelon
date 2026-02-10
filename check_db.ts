
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
const result = dotenv.config({ path: envPath });

console.log(`[Debug] Loading .env.local from: ${envPath}`);
if (result.error) {
    console.error(`[Debug] dotenv error:`, result.error);
} else {
    console.log(`[Debug] dotenv parsed keys:`, Object.keys(result.parsed || {}));
}

console.log(`[Debug] DATABASE_URL in process.env: ${process.env.DATABASE_URL ? "Defined (Starts with " + process.env.DATABASE_URL.substring(0, 10) + ")" : "UNDEFINED"}`);

if (!process.env.DATABASE_URL) {
    console.error("[Debug] DATABASE_URL is missing. Exiting.");
    process.exit(1);
}

// Using 'accelerateUrl' to satisfy runtime requirement
const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL
} as any);

async function main() {
    try {
        const count = await prisma.product.count();
        console.log(`[Success] Product Count: ${count}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { withAccelerate } from '@prisma/extension-accelerate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcode URL for stability in this environment
const connectionString = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza196UGJua3ZYMjN6c0ZXOGdJYk1iSHciLCJhcGlfa2V5IjoiMDFLRjYzVFRaQk1TNThWNFozVktZMVNXQzUiLCJ0ZW5hbnRfaWQiOiI5NThhZDU4NThmOWQ1MGIwOWQxYTM1Mjc1ZmU1NTdhYjg2NzEyOTUxNWFhNmRlZmY5NTJlMThmYjY3NDJkNzVhIiwiaW50ZXJuYWxfc2VjcmV0IjoiMTkzYmJkMzEtNGViMS00MWExLTgwZTUtYTBmMWEzOWExMGUxIn0.txXDqLIka8Q24nM5WrkO9PiRyX8TFjMB6HMgE34qEpw&connect_timeout=60";

const prisma = new PrismaClient({
    accelerateUrl: connectionString,
}).$extends(withAccelerate());

async function main() {
    console.log("Updating product images...");

    const u1 = await prisma.product.updateMany({
        where: { name: "Aethelon Regatta Master" },
        data: { images: ["/products/regatta.png"] }
    });
    console.log(`Updated Regatta: ${u1.count}`);

    const u2 = await prisma.product.updateMany({
        where: { name: "Aethelon Stealth Ops" },
        data: { images: ["/products/stealth.png"] }
    });
    console.log(`Updated Stealth: ${u2.count}`);

    const u3 = await prisma.product.updateMany({
        where: { name: "Aethelon Chronograph Steel" },
        data: { images: ["/products/chronograph-steel.png"] }
    });
    console.log(`Updated Chronograph Steel: ${u3.count}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => await prisma.$disconnect());

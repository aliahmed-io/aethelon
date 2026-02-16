
import 'dotenv/config';
import prisma from '../lib/db';
import { generateEmbedding } from '../lib/ai/embeddings';

async function main() {
    console.log("Starting embedding generation...");

    // Fetch all products that don't have embeddings (or just all for now to be safe)
    // Prisma doesn't support filtering by 'Unsupported' fields easily, so we fetch all
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            tags: true,
            category: { select: { name: true } }
        }
    });

    console.log(`Found ${products.length} products to process.`);

    let validCount = 0;
    let errorCount = 0;

    for (const product of products) {
        try {
            // Construct semantic text
            const textToEmbed = `
                Name: ${product.name}
                Category: ${product.category?.name || 'Unknown'}
                Description: ${product.description}
                Tags: ${product.tags.join(', ')}
            `.trim();

            console.log(`Generating embedding for: ${product.name}`);

            const embedding = await generateEmbedding(textToEmbed);

            if (!embedding) {
                console.warn(`Skipping ${product.name}: Failed to generate embedding.`);
                errorCount++;
                continue;
            }

            // Update product with vector embedding using raw SQL
            // Prisma Client doesn't natively support writing to Unsupported fields yet in typed queries
            // We cast the array to a vector string format: '[0.1, 0.2, ...]'
            const vectorString = `[${embedding.join(',')}]`;

            await prisma.$executeRawUnsafe(
                `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
                vectorString,
                product.id
            );

            validCount++;
            // Rate limit safety - 10 requests per second max for Gemini Free tier is usually plenty,
            // but let's be nice.
            await new Promise(r => setTimeout(r, 500));

        } catch (error) {
            console.error(`Error processing ${product.name}:`, error);
            errorCount++;
        }
    }

    console.log(`\nFinished! Processed: ${validCount}, Errors: ${errorCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

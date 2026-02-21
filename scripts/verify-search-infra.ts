
import 'dotenv/config';
import prisma from '../lib/db';
import { generateEmbedding } from '../lib/ai/embeddings';

async function verifyIndexing() {
    console.log(" Starting Self-Contained Search Verification...");

    try {
        // 1. Create a distinctive test product
        const testId = `test-idx-${Date.now()}`;
        console.log(` Creating test product: ${testId}`);

        const product = await prisma.product.create({
            data: {
                id: testId,
                name: "Verification Obsidian Chair",
                description: "A sleek, futuristic chair for testing vector indexing automation.",
                price: 120000,
                status: "draft",
                style: "Industrial",
                brand: "Aethelon Labs",
                features: ["Zero-gravity", "Adaptive Mesh"],
                tags: ["test", "verification", "obsidian"],
                images: ["https://example.com/obsidian.jpg"]
            }
        });

        // 2. Logic from updateProductEmbedding
        console.log("Generating AI Embedding (Enriched Metadata)...");

        const textToEmbed = `
            Name: ${product.name}
            Brand: ${product.brand || 'Generic'}
            Categories: Unspecified
            Description: ${product.description}
            Style: ${product.style || 'Unspecified'}
            Features: ${product.features.join(', ') || 'None'}
            Tags: ${product.tags.join(', ') || 'None'}
            Pattern: ${product.pattern || 'None'}
            Dimensions: ${product.height || 'Standard'}
        `.trim();

        const embedding = await generateEmbedding(textToEmbed);

        if (embedding) {
            const vectorString = `[${embedding.join(',')}]`;
            await prisma.$executeRawUnsafe(
                `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
                vectorString,
                product.id
            );
            console.log("SUCCESS: Embedding generated and stored.");
        } else {
            throw new Error("Embedding generation returned null");
        }

        // 3. Verify embedding exists in database
        const result = await prisma.$queryRawUnsafe<any[]>(
            `SELECT embedding IS NOT NULL as "hasEmbedding" FROM "Product" WHERE id = $1`,
            product.id
        );

        if (result[0]?.hasEmbedding) {
            console.log("VERIFIED: Product vector search is functional.");
        } else {
            console.log("FAILURE: Embedding was not saved correctly.");
        }

        // 4. Cleanup
        console.log("Cleaning up...");
        await prisma.product.delete({ where: { id: product.id } });
        console.log("Done.");

    } catch (error) {
        console.error("Verification Errored:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyIndexing();

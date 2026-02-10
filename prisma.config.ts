// prisma.config.ts - Prisma configuration for migrations and introspection
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    // Add seed configuration
    // @ts-ignore - The types might be behind on the preview feature
    migrations: {
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        // For prisma+postgres:// URLs, Prisma can handle migrations directly
        // Falls back to DATABASE_URL from environment
        url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || '',
    },
});

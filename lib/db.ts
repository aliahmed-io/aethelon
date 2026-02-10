// lib/db.ts - Production-level Prisma Accelerate setup
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Type for the extended Prisma Client
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

// Global cache to prevent multiple instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    // accelerateUrl is the correct property for Prisma Accelerate
    accelerateUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
}

// Use cached client in development, create new in production
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache the client in development to prevent exhausting connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

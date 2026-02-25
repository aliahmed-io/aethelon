import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';

const prismaClientSingleton = () => {
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(withAccelerate());
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Always create a fresh client in development so env var changes are picked up
const prisma = process.env.NODE_ENV === "production"
  ? (globalThis.prismaGlobal ?? prismaClientSingleton())
  : prismaClientSingleton();

export const safeQuery = async <T>(query: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await query;
  } catch (error: any) {
    // Log ALL errors in dev so we can diagnose issues
    console.error('[safeQuery] Error:', error.code, error.message?.substring(0, 300));
    // P6xxx = Prisma Accelerate errors (quota, plan limits, etc.)
    if (error.code?.startsWith('P6')) {
      return fallback;
    }
    throw error;
  }
};

export default prisma;

if (process.env.NODE_ENV === "production") globalThis.prismaGlobal = prisma;

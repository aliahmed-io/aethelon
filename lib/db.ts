import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import { withOptimize } from '@prisma/extension-optimize';

const prismaClientSingleton = () => {
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(withAccelerate()).$extends(withOptimize({ apiKey: process.env.PRISMA_OPTIMIZE_API_KEY || "" }));
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export const safeQuery = async <T>(query: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await query;
  } catch (error: any) {
    // P6003 is plan limit reached. All P6xxx are Accelerate errors.
    if (error.code?.startsWith('P6')) {
      console.error('[Prisma Accelerate Quota/Error]', error.message);
      return fallback;
    }
    throw error;
  }
};

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

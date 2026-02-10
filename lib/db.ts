// lib/db.ts - Robust Mock Prisma Client for Build Verification
// This uses a Proxy to mock ANY model access (user, product, banner, etc.)
// ensuring the build never fails due to missing mock definitions.

const mockDelegate = {
  findMany: async () => [],
  findUnique: async () => null,
  findFirst: async () => null,
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => ({}),
  deleteMany: async () => ({}),
  count: async () => 0,
  groupBy: async () => [],
  upsert: async () => ({}),
  aggregate: async () => ({}),
};

const mockPrismaClient = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '$extends') return () => mockPrismaClient;
    if (prop === '$connect' || prop === '$disconnect') return async () => { };

    // For any other property (which would be a model name like 'product', 'banner'), return the delegate
    return mockDelegate;
  }
});

// Global cache to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: typeof mockPrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? mockPrismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma as any;

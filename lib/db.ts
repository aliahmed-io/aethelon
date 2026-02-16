import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma =
  process.env.DATABASE_URL
    ? globalThis.prismaGlobal ?? prismaClientSingleton()
    : (new Proxy(
      {},
      {
        get() {
          throw new Error("DATABASE_URL is missing");
        },
      }
    ) as unknown as ReturnType<typeof prismaClientSingleton>);

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  process.env.NODE_ENV === "production"
    ? new PrismaClient()
    : global.prisma || (global.prisma = new PrismaClient());

export default prisma;

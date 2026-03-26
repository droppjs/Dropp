// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { PrismaMediaRepository } from "@dropp/db-prisma";

const prisma = new PrismaClient();

export const mediaRepository = async () => {
  return new PrismaMediaRepository(prisma);
};

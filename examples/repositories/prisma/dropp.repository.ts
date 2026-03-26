// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { PrismaMediaRepository } from "@droppjs/db-prisma";

const prisma = new PrismaClient();

export const mediaRepository = async () => {
  return new PrismaMediaRepository(prisma);
};

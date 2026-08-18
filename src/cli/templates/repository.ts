export const ORM_OPTIONS = [
  "prisma",
  "typeorm",
  "drizzle",
  "sequelize",
  "mikroorm",
  "mongoose",
  "kysely",
] as const;

export type SupportedOrm = (typeof ORM_OPTIONS)[number];

export function renderRepositoryTemplate(orm: SupportedOrm): string {
  const templates: Record<SupportedOrm, string> = {
    prisma: `import { PrismaClient } from "@prisma/client";
import { PrismaMediaRepository } from "droppjs";

const prisma = new PrismaClient();

export const mediaRepository = async () => {
  return new PrismaMediaRepository(prisma);
};
`,
    typeorm: `import { DataSource } from "typeorm";
import { TypeOrmMediaRepository } from "droppjs";

// Replace this with your actual Media entity class
import { MediaEntity } from "./entities/MediaEntity.js";

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_NAME ?? "app",
  entities: [MediaEntity],
  synchronize: false,
});

export const mediaRepository = async () => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(MediaEntity);
  return new TypeOrmMediaRepository(repo);
};
`,
    drizzle: `import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { DrizzleMediaRepository } from "droppjs";

// Replace this with your actual Drizzle media table object
import { mediaTable } from "./schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export const mediaRepository = async () => {
  return new DrizzleMediaRepository(db, mediaTable);
};
`,
    sequelize: `import { Sequelize } from "sequelize";
import { SequelizeMediaRepository } from "droppjs";

// Replace this with your Sequelize model
import { MediaModel } from "./models/MediaModel.js";

const sequelize = new Sequelize(
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/app",
  { logging: false },
);

export const mediaRepository = async () => {
  await sequelize.authenticate();
  return new SequelizeMediaRepository(MediaModel);
};
`,
    mikroorm: `import { MikroORM } from "@mikro-orm/core";
import { MikroOrmMediaRepository } from "droppjs";

// Replace this with your MikroORM entity
import { MediaEntity } from "./entities/MediaEntity.js";

let ormPromise;

function getOrm() {
  if (!ormPromise) {
    ormPromise = MikroORM.init({
      entities: [MediaEntity],
      dbName: process.env.DB_NAME ?? "app",
      type: "postgresql",
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "postgres",
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 5432),
    });
  }

  return ormPromise;
}

export const mediaRepository = async () => {
  const orm = await getOrm();
  const em = orm.em.fork();
  const repo = em.getRepository(MediaEntity);
  return new MikroOrmMediaRepository(repo, em);
};
`,
    mongoose: `import mongoose from "mongoose";
import { MongooseMediaRepository } from "droppjs";

// Replace this with your Mongoose model
import { MediaModel } from "./models/MediaModel.js";

let connected = false;

async function ensureConnection() {
  if (connected) return;

  await mongoose.connect(
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/app",
  );

  connected = true;
}

export const mediaRepository = async () => {
  await ensureConnection();
  return new MongooseMediaRepository(MediaModel);
};
`,
    kysely: `import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { KyselyMediaRepository } from "droppjs";

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export const mediaRepository = async () => {
  return new KyselyMediaRepository(db, "media");
};
`,
  };

  return templates[orm];
}

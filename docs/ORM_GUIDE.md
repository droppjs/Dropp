# ORM guide

Dropp does not replace your ORM. Generate the model and repository, then pass the adapter in.

```bash
npx dropp generate:all media --orm prisma
npx dropp migrate --orm prisma --mode dev
```

Or one piece at a time:

```bash
npx dropp generate:model media --orm prisma
npx dropp generate:repository prisma
npx dropp generate:migration create-media-table --orm prisma
```

App code still constructs Dropp itself:

```ts
new Dropp({
  repository: new PrismaMediaRepository(prisma),
  storage, // unchanged
});
```

`dropp.config.json` is what the CLI reads (`attach`, `list`, `doctor`). Next.js / Express / NestJS can use the same generated repository or construct the class directly.

If you have not uploaded a file yet, run `npx dropp init` and `npx dropp attach` from the [README](../README.md) first.

---

## Prisma (most common)

`generate:all media --orm prisma` writes `prisma/schema.media.prisma`. Copy that `Media` model into your main `schema.prisma` (or `include` it), then migrate.

The generated model looks like this:

```prisma
model Media {
  id         String   @id @default(uuid())
  model      String
  modelId    String
  collection String
  fileName   String
  mimeType   String
  size       Int
  disk       String
  path       String
  url        String
  metadata   Json
  createdAt  DateTime @default(now())

  @@map("media")
}
```

The adapter calls `prisma.media.*`, so the Prisma model name must be `Media`.

### 2. Wire it

```ts
import { PrismaClient } from "@prisma/client";
import { Dropp, PrismaMediaRepository, LocalStorageDriver } from "droppjs";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const dropp = new Dropp({
  repository: new PrismaMediaRepository(prisma),
  storage: new LocalStorageDriver("public/uploads", "/uploads"),
});
```

In Next.js, keep this in `lib/dropp.ts` (server-only). Routes stay the same as in the README.

`PrismaMediaRepository` implements `create`, `findById`, `findByModel`, and `delete`. Methods that need `update` / `findMany` (versioned replace, `list()`) require those methods on the repository. `JsonFileMediaRepository` has them; the Prisma adapter currently does not. Use `attach` / `get` / `getByModel` / `delete` with Prisma, or extend the class if you need the rest.

---

## Other ORMs

Pass your existing client into the matching class:

| ORM | Class | Constructor |
| --- | --- | --- |
| Prisma | `PrismaMediaRepository` | `(prisma)` |
| TypeORM | `TypeOrmMediaRepository` | see [examples/repositories/typeorm](../examples/repositories/typeorm/dropp.repository.ts) |
| Drizzle | `DrizzleMediaRepository` | `(db, mediaTable)` |
| Sequelize | `SequelizeMediaRepository` | see [examples/repositories/sequelize](../examples/repositories/sequelize/dropp.repository.ts) |
| MikroORM | `MikroOrmMediaRepository` | see [examples/repositories/mikroorm](../examples/repositories/mikroorm/dropp.repository.ts) |
| Mongoose | `MongooseMediaRepository` | see [examples/repositories/mongoose](../examples/repositories/mongoose/dropp.repository.ts) |
| Kysely | `KyselyMediaRepository` | see [examples/repositories/kysely](../examples/repositories/kysely/dropp.repository.ts) |

Schema fields should match the `Media` type: `id`, `model`, `modelId`, `tenantId?`, `collection`, `fileName`, `mimeType`, `size`, `disk`, `path`, `url`, `metadata`, `createdAt`.

---

## Repository contract

```ts
interface MediaRepository {
  create(data: MediaCreateInput): Promise<Media>;
  findById(id: string): Promise<Media | null>;
  findByModel(model: string, modelId: string): Promise<Media[]>;
  delete(id: string): Promise<void>;
  findMany?(query: MediaQuery): Promise<Media[]>;
  update?(id: string, patch: Partial<Media>): Promise<Media | null>;
}
```

`create` / `findById` / `findByModel` / `delete` are required. `findMany` and `update` unlock listing filters and versioned replace.

---

## CLI config module

`npx dropp generate:repository prisma` writes `dropp.repository.ts` and points `dropp.config.json` at it so `dropp attach` / `dropp list` use the same database as the app.

```json
{
  "orm": {
    "driver": "prisma",
    "repository": {
      "module": "./dropp.repository.js",
      "exportName": "mediaRepository"
    }
  }
}
```

The module must export `mediaRepository` (instance or async factory). Compile TypeScript to `.js` before the CLI runs.

```bash
npx dropp config:validate
npx dropp doctor --verbose
```

Common mistakes: wrong module path, export name not `mediaRepository`, TS file not compiled, missing DB env vars.

---

## Related

- [Adapters](ADAPTERS.md): storage + repository + framework
- [Framework guide](FRAMEWORK_GUIDE.md): Next.js / Express / NestJS
- [Cookbook](COOKBOOK.md): attach, replace, queries

# Repository examples

App code should construct the adapter directly (`new PrismaMediaRepository(prisma)`). See [docs/ORM_GUIDE.md](../../docs/ORM_GUIDE.md).

The files below show the older CLI pattern: export `mediaRepository` so `dropp.config` can load it. Use that only if you want the CLI to talk to the same database.

## Config pattern

```json
{
  "orm": {
    "driver": "custom",
    "repository": {
      "module": "./dropp.repository.js",
      "exportName": "mediaRepository"
    }
  }
}
```

> Build/transpile your repository file to `.js` when running in Node ESM.

## Available examples

- Prisma: `examples/repositories/prisma/dropp.repository.ts`
- TypeORM: `examples/repositories/typeorm/dropp.repository.ts`
- Drizzle: `examples/repositories/drizzle/dropp.repository.ts`
- Sequelize: `examples/repositories/sequelize/dropp.repository.ts`
- MikroORM: `examples/repositories/mikroorm/dropp.repository.ts`
- Mongoose: `examples/repositories/mongoose/dropp.repository.ts`
- Kysely: `examples/repositories/kysely/dropp.repository.ts`

Each file exports `mediaRepository`, compatible with `resolveRepository()`.

Tip: you can also scaffold one with CLI:

- `dropp generate:repository prisma`
- `dropp generate:repository typeorm`

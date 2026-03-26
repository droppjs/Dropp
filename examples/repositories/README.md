# Dropp Repository Adapters (Examples)

These examples show how to wire `orm.repository.module` for different ORMs.

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

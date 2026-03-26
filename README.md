# Dropp

Dropp is a media management toolkit for Node.js and TypeScript.

Think of it as your media department in a box: upload files, transform them, store them anywhere, and keep metadata clean without writing 700 lines of glue code before lunch.

## What you get

- Framework-agnostic core (`@dropp/core`)
- CLI with enterprise command coverage (`@dropp/cli`)
- ORM adapters for Prisma, TypeORM, Drizzle, Sequelize, MikroORM, Mongoose, and Kysely
- Storage adapters for Local, S3, Cloudflare R2, Azure Blob, and GCS
- Image/video transformers
- Plugin hooks and ready-made plugins

## Monorepo map

- `packages/core` - orchestration engine and attach/get/delete workflows
- `packages/cli` - `dropp` command-line interface
- `packages/db/*` - ORM repository adapters
- `packages/storage/*` - storage drivers
- `packages/transformer/*` - media transformation drivers
- `packages/queue/bullmq` - async processing queue adapter
- `packages/plugins/*` - plugin ecosystem
- `packages/types` - shared contracts and domain types
- `packages/config` - config schema and loading utilities

## Fast start

1. Install dependencies:
   - `pnpm install`
2. Build all packages:
   - `pnpm build`
3. Initialize config:
   - `pnpm --filter @dropp/cli dev init`
4. Run doctor checks:
   - `pnpm --filter @dropp/cli dev doctor --verbose`

If `doctor` is happy, your future self will also be happy.

## Documentation index

- Quick start: [docs/QUICK_START.md](docs/QUICK_START.md)
- ORM guide: [docs/ORM_GUIDE.md](docs/ORM_GUIDE.md)
- Framework guide: [docs/FRAMEWORK_GUIDE.md](docs/FRAMEWORK_GUIDE.md)
- Adapter reference: [docs/ADAPTERS.md](docs/ADAPTERS.md)
- Plugin development: [docs/PLUGIN_GUIDE.md](docs/PLUGIN_GUIDE.md)

## Repository adapter examples

Ready-to-use examples live in:

- `examples/repositories/prisma`
- `examples/repositories/typeorm`
- `examples/repositories/drizzle`
- `examples/repositories/sequelize`
- `examples/repositories/mikroorm`
- `examples/repositories/mongoose`
- `examples/repositories/kysely`

## Built-in plugins

- Watermark - brand overlays and text watermarking
- AI Tagging - automatic tag generation
- SEO - alt text and metadata helpers

See [docs/PLUGIN_GUIDE.md](docs/PLUGIN_GUIDE.md) for plugin authoring and lifecycle hooks.

# Quick Start

Welcome to Dropp. The goal here is simple: get media flowing in minutes, not after a two-day configuration quest.

## 1) Install and build

- `pnpm install`
- `pnpm build`

## 2) Create config

- `pnpm --filter @dropp/cli dev config:init`

This creates a starting config file. You can also keep `dropp.config.json` at the project root.

## 3) Validate setup

- `pnpm --filter @dropp/cli dev config:validate`
- `pnpm --filter @dropp/cli dev doctor --verbose`

If `doctor` says something is missing, trust it. It has seen things.

## 4) Attach your first file

- `pnpm --filter @dropp/cli dev attach ./sample.jpg --model post --modelId 1 --collection cover`

## 5) Verify media exists

- `pnpm --filter @dropp/cli dev list --limit 10`

## 6) Inspect one item

- `pnpm --filter @dropp/cli dev info <media-id>`

## 7) Transform and optimize

- `pnpm --filter @dropp/cli dev convert <media-id> --resizeWidth 1200 --webp`
- `pnpm --filter @dropp/cli dev optimize <media-id>`

## Storage driver options

Set `storage.driver` in config to one of:

- `local`
- `s3`
- `r2`
- `azure`
- `gcs`

## ORM driver options

Set `orm.driver` to one of:

- `prisma`
- `typeorm`
- `drizzle`
- `sequelize`
- `mikroorm`
- `mongoose`
- `kysely`
- `custom`

## Next steps

- ORM setup: [ORM_GUIDE.md](ORM_GUIDE.md)
- Framework setup: [FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md)
- Plugin development: [PLUGIN_GUIDE.md](PLUGIN_GUIDE.md)
- Adapter reference: [ADAPTERS.md](ADAPTERS.md)

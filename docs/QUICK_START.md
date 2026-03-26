# Quick Start

This guide gets you from zero to first upload in a few minutes.

## 1) Install and build

- `pnpm install`
- `pnpm build`

## 2) Initialize config

- `pnpm --filter @dropp/cli dev config:init`

## 3) Check environment

- `pnpm --filter @dropp/cli dev doctor --verbose`

## 4) Upload your first file

- `pnpm --filter @dropp/cli dev attach ./sample.jpg --model post --modelId 1 --collection cover`

## 5) View uploaded media

- `pnpm --filter @dropp/cli dev list --limit 10`

## 6) Inspect one media item

- `pnpm --filter @dropp/cli dev info <media-id>`

## 7) Optional: optimize/convert

- `pnpm --filter @dropp/cli dev optimize <media-id>`
- `pnpm --filter @dropp/cli dev convert <media-id> --resizeWidth 1200 --webp`

## Next docs

- ORM setup: [ORM_GUIDE.md](ORM_GUIDE.md)
- Framework integration: [FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md)
- Plugins: [PLUGIN_GUIDE.md](PLUGIN_GUIDE.md)
- Adapters: [ADAPTERS.md](ADAPTERS.md)

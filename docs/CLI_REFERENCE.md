# CLI Reference

The CLI is how you set Dropp up. App code still calls `dropp.attach()` after that.

```bash
npx dropp init
npx dropp generate:adapter next
npx dropp doctor --verbose
npx dropp attach ./photo.jpg --model posts --modelId 42
npx dropp list --limit 10
```

From a clone of this repo, use `node ./bin/run.js` instead of `npx dropp`.

TypeScript API: [API_REFERENCE.md](API_REFERENCE.md). First-run walkthrough: [README](../README.md).

## Common flags

- `--json` for machine-readable output
- `--help` for command-level help

## Core command flags (quick lookup)

Think of this as your "don't-make-me-open-help-10-times" section.

### `attach`

- Required: `--model`, `--modelId`
- Optional: `--tenantId`, `--collection`, `--metadata`, `--json`

### `list`

- Optional filters: `--model`, `--modelId`, `--tenantId`, `--collection`, `--mimeType`, `--fileName`
- Optional date filters: `--createdAfter`, `--createdBefore`
- Optional paging/sort: `--sort`, `--limit`, `--json`

### `convert`

- Optional: `--resizeWidth`, `--resizeHeight`, `--webp`, `--json`

### `migrate`

- Required intent: `--orm`, `--mode`
- Optional: `--name`, `--dryRun`

### `doctor`

- Optional: `--verbose`, `--strict`, `--json`

## Setup and health

- `dropp init`
- `dropp config:init`
- `dropp config:show`
- `dropp config:validate`
- `dropp doctor --verbose`

## Core media operations

- `dropp attach <file> --model <name> --modelId <id> [--collection <name>]`
- `dropp get <mediaId>`
- `dropp info <mediaId>`
- `dropp list [--limit <n>]`
- `dropp remove <mediaId>`
- `dropp rollback <mediaId>`

## Transform and optimization

- `dropp optimize <mediaId>`
- `dropp convert <mediaId> [--resizeWidth <n>] [--webp]`
- `dropp responsive-generate <mediaId>`

## Upload and processing extras

- `dropp upload:resumable <file> --model <name> --modelId <id>`
- `dropp batch`
- `dropp batch:process`
- `dropp watch`
- `dropp server:start`

## Collections

- `dropp collections`
- `dropp collections:create <name>`
- `dropp collections:list`
- `dropp collections:add-media <collection> <mediaId>`
- `dropp collections:remove-media <collection> <mediaId>`

## Plugins

- `dropp plugin`
- `dropp plugin:install <name>`
- `dropp plugin:list`
- `dropp plugin:remove <name>`

## Generate scaffolding

- `dropp generate:adapter next|express|nestjs`: framework upload files
- `dropp generate:all <name> --orm <driver>`: repository + model + migration + config
- `dropp generate:model <name> --orm <driver>`
- `dropp generate:repository <driver>`
- `dropp generate:migration <name> --orm <driver>`
- `dropp generate adapter next`: same as `generate:adapter`

## ORM migrations

- `dropp migrate --orm prisma --mode dev`
- `dropp migrate --orm drizzle --mode deploy`
- `dropp migrate --orm typeorm --mode status`

## Storage, CDN, analytics

- `dropp storage-sync`
- `dropp cdn:invalidate`
- `dropp analytics:report`

## Recommended user flow

1. `npx dropp init`
2. `npx dropp generate:adapter next` (skip if you only want the CLI)
3. `npx dropp doctor --verbose`
4. `npx dropp attach ./sample.jpg --model posts --modelId 1 --collection cover`
5. `npx dropp list --limit 10`

If step 5 shows your media, setup is done. If not, run `doctor` again.

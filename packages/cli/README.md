# @dropp/cli

`dropp` is the command-line cockpit for your media workflows.

If your team has ever said, “we should probably organize uploads better,” this is where that sentence becomes reality.

## Install

From this monorepo:

- `pnpm --filter @dropp/cli build`

Run in dev mode:

- `pnpm --filter @dropp/cli dev <command>`

## First 5 commands to run

1. `dropp init`
2. `dropp config:init`
3. `dropp config:validate`
4. `dropp doctor --verbose`
5. `dropp list --limit 10`

If step 4 fails, that is a feature, not a bug. It just saved you from a future mystery.

## Command groups

### Core media

- `dropp attach <file> --model <name> --modelId <id> [--tenantId <id>]`
- `dropp list [filters...]`
- `dropp get <id>`
- `dropp info <id>`
- `dropp remove <id>`
- `dropp convert <id> [--resizeWidth <n>] [--resizeHeight <n>] [--webp]`
- `dropp optimize <id>`

### Collections

- `dropp collections:create <name> [--description <text>] [--customProperties <json>]`
- `dropp collections:list`
- `dropp collections:add-media <collectionId> <mediaId>`
- `dropp collections:remove-media <collectionId> <mediaId>`

### Config and health

- `dropp config:init [--force]`
- `dropp config:show [--json]`
- `dropp config:validate [--json]`
- `dropp doctor [--json] [--verbose] [--strict]`
- `dropp migrate [--orm <driver>] [--mode dev|deploy|status] [--name <migration-name>] [--dry-run]`

### Advanced workflows

- `dropp batch:process <configFile> [--dryRun] [--resume] [--checkpointFile <path>] [--concurrency <n>] [--stopOnError] [--json]`
- `dropp watch --dir <path> --model <name> --modelId <id> [--collection <name>]`
- `dropp responsive-generate <id> [--json]`
- `dropp storage-sync [--fromDir <path>] [--dryRun] [--json]`
- `dropp upload:resumable <file> --model <name> --modelId <id> [--tenantId <id>] [--chunkSizeMb <n>] [--resume]`
- `dropp rollback <id> [--json]`
- `dropp analytics:report [--tenantId <id>] [--json]`
- `dropp cdn:invalidate --path <path> [--path <path2>] [--json]`
- `dropp server:start [--port <n>]`

### Scaffolding

- `dropp generate repository <orm>`
- `dropp generate model <name> --orm <orm>`
- `dropp generate migration <name> --orm <orm>`
- `dropp generate all <name> --orm <orm>`

Compatibility aliases are also available:

- `generate:repository`
- `generate:model`
- `generate:migration`
- `generate:all`

### Plugins

- `dropp plugin:install <name>`
- `dropp plugin:list [--json]`
- `dropp plugin:remove <name>`

## Useful examples

Attach one file:

- `dropp attach ./assets/hero.jpg --model post --modelId 42 --collection cover`

List only PNG files created this month:

- `dropp list --mimeType image/png --createdAfter 2026-03-01T00:00:00.000Z`

Get machine-readable output for scripts:

- `dropp info <media-id> --json`

Run strict environment checks in CI:

- `dropp doctor --strict`

## Docs

- Workspace quick start: [../../docs/QUICK_START.md](../../docs/QUICK_START.md)
- ORM setup: [../../docs/ORM_GUIDE.md](../../docs/ORM_GUIDE.md)
- Framework integration: [../../docs/FRAMEWORK_GUIDE.md](../../docs/FRAMEWORK_GUIDE.md)
- Plugin authoring: [../../docs/PLUGIN_GUIDE.md](../../docs/PLUGIN_GUIDE.md)

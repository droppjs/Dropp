# @droppjs/cli

`dropp` is the CLI for daily media workflows.

## Start fast

- `pnpm --filter @droppjs/cli dev config:init`
- `pnpm --filter @droppjs/cli dev doctor --verbose`
- `pnpm --filter @droppjs/cli dev attach ./sample.jpg --model post --modelId 1 --collection cover`
- `pnpm --filter @droppjs/cli dev list --limit 10`

## Common commands

### Media

- `dropp attach <file> --model <name> --modelId <id>`
- `dropp list`
- `dropp info <id>`
- `dropp get <id>`
- `dropp remove <id>`

### Optimization

- `dropp convert <id> [options]`
- `dropp optimize <id>`
- `dropp responsive-generate <id>`

### Operations

- `dropp batch:process <configFile>`
- `dropp upload:resumable <file> --model <name> --modelId <id>`
- `dropp analytics:report`
- `dropp cdn:invalidate --path <path>`
- `dropp server:start`

### Plugins

- `dropp plugin:install <name>`
- `dropp plugin:list`
- `dropp plugin:remove <name>`

## Need help

- `dropp --help`
- `dropp <command> --help`

## More docs

- Quick start: [../../docs/QUICK_START.md](../../docs/QUICK_START.md)
- Plugin guide: [../../docs/PLUGIN_GUIDE.md](../../docs/PLUGIN_GUIDE.md)

# Quick start

Install, init, upload. No framework required.

```bash
npm install droppjs
npx dropp init
npx dropp doctor --verbose
npx dropp attach ./photo.jpg --model products --modelId sku-1001 --collection gallery
npx dropp list --limit 10
```

That stores the file on disk and the metadata in `.dropp/media.json`.

## Next.js, Express, or NestJS

```bash
npx dropp generate:adapter next
npx dropp generate:adapter express
npx dropp generate:adapter nestjs
```

[FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md) shows the generated files.

## Prisma (or another database)

```bash
npx dropp generate:all media --orm prisma
npx dropp migrate --orm prisma --mode dev
```

[ORM_GUIDE.md](ORM_GUIDE.md)

## Commands

| Command | What it does |
| --- | --- |
| `npx dropp init` | Write `dropp.config.json` |
| `npx dropp doctor --verbose` | Check config |
| `npx dropp attach <file> --model <name> --modelId <id>` | Upload |
| `npx dropp list` / `get` / `remove` | Inspect and delete |
| `npx dropp generate:adapter next` | Next.js upload routes |

[CLI_REFERENCE.md](CLI_REFERENCE.md)

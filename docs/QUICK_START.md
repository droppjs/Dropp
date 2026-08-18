# Quick start

```bash
npm install droppjs
npx dropp init
npx dropp doctor --verbose
npx dropp attach ./photo.jpg --model posts --modelId 42 --collection cover
npx dropp list --limit 10
```

That is a working upload with no framework. Config lives in `dropp.config.json`. Metadata goes to `.dropp/media.json`. Files go to the local folder in config (`media` by default, or `public/uploads` after `generate:adapter next`).

## Put it in an app

```bash
npx dropp generate:adapter next      # Next.js App Router
npx dropp generate:adapter express   # Express
npx dropp generate:adapter nestjs    # NestJS
```

Then [FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md) for how those files are used.

## Use Prisma (or another ORM)

```bash
npx dropp generate:all media --orm prisma
npx dropp migrate --orm prisma --mode dev
```

[ORM_GUIDE.md](ORM_GUIDE.md) for the rest.

## Useful commands

| Command | What it does |
| --- | --- |
| `npx dropp init` | Write `dropp.config.json` |
| `npx dropp doctor --verbose` | Check config / env |
| `npx dropp attach <file> --model <name> --modelId <id>` | Upload |
| `npx dropp list` / `get` / `info` / `remove` | Inspect and delete |
| `npx dropp generate:adapter next` | Scaffold Next.js routes |
| `npx dropp generate:all media --orm prisma` | Model + repository + migration |
| `npx dropp plugin:install watermark` | Enable a built-in plugin |

Full list: [CLI_REFERENCE.md](CLI_REFERENCE.md).

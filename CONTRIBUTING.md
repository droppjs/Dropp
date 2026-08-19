# Contributing

## Setup

```bash
pnpm install
pnpm typecheck
pnpm test
```

Node.js 20+ and pnpm 10 are required.

## What to change

- Library and CLI live in `src/`
- First-run docs belong in `README.md`
- Deeper guides belong in `docs/`

Do not add native tools (`sharp`, `ffmpeg-static`) or cloud SDKs to `dependencies`. Those stay optional peers. Keep them in `devDependencies` so this repo can typecheck.

## Pull requests

1. Keep the change focused
2. Run `pnpm typecheck` and `pnpm test`
3. Avoid drive-by refactors and generated noise

## Issues

Use the GitHub issue templates. Security reports go through [SECURITY.md](SECURITY.md), not a public issue.

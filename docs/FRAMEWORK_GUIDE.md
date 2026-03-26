# Framework Integration Guide

Pick the adapter that fits your app. Ship faster, debate less.

## Express

Package: `@usedropp/adapter-express`

Best for middleware-first APIs.

## NestJS

Package: `@usedropp/adapter-nestjs`

Best for modules, decorators, and service layers.

## Next.js

Package: `@usedropp/adapter-next`

Best for App Router handlers and full-stack React apps.

Detailed adapter setup:

- [ADAPTERS.md](ADAPTERS.md)

## Integration checklist

1. Initialize `Dropp` once per app context
2. Ensure upload middleware/interceptor provides file buffers
3. Always pass `model` and `modelId`
4. Run `doctor` before blaming your framework
5. Keep adapter code thin; keep business logic in services

## Test coverage status

Adapter integration tests exist for Express, NestJS, and Next.js.

Run:

- `pnpm test:adapters`

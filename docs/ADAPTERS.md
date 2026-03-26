# Framework Adapters

Dropp works with your app style instead of forcing a rewrite.

Pick one adapter, wire it once, and move on with your life.

## Quick chooser

- Express → `@droppjs/adapter-express` (middleware-first)
- NestJS → `@droppjs/adapter-nestjs` (service/controller style)
- Next.js → `@droppjs/adapter-next` (App Router handlers)

## Express

Best when you want direct control and simple route wiring.

Install:

- `pnpm add @droppjs/adapter-express @droppjs/core @droppjs/types express multer`

Flow:

1. Parse file with `multer`
2. Run `droppAttachMiddleware(...)`
3. Return `req.media`
4. Add `droppErrorHandler()` once

## NestJS

Best when your app already uses modules, services, and decorators.

Install:

- `pnpm add @droppjs/adapter-nestjs @droppjs/core @droppjs/types @nestjs/common @nestjs/core @nestjs/platform-express`

Flow:

1. Inject a `Dropp` instance
2. Use file interceptor
3. Delegate upload/get/delete to Dropp service or controller

## Next.js

Best when your API lives in App Router route handlers.

Install:

- `pnpm add @droppjs/adapter-next @droppjs/core @droppjs/types next`

Flow:

1. Read `model` and `modelId` from request
2. Call `handleUpload`, `handleGetMedia`, `handleDeleteMedia`, or `handleGetModelMedia`
3. Return the handler response directly

## Rules that prevent pain

- Always pass both `model` and `modelId`
- Keep adapter code thin; put business logic in your own services
- Run `dropp doctor --verbose` before deep debugging
- Use `--json` flags when scripting in CI

## Testing

Integration tests are included for Express, NestJS, and Next.js.

Run:

- `pnpm test:adapters`

## Related docs

- Quick start: [QUICK_START.md](QUICK_START.md)
- ORM setup: [ORM_GUIDE.md](ORM_GUIDE.md)
- Framework setup: [FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md)
- Plugin guide: [PLUGIN_GUIDE.md](PLUGIN_GUIDE.md)

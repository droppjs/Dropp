# Adapter examples

Reference apps for the `droppjs` framework helpers. For the step-by-step first upload, use the [README](../../README.md) and [docs/FRAMEWORK_GUIDE.md](../../docs/FRAMEWORK_GUIDE.md).

## Files

- [express/complete-app.ts](express/complete-app.ts)
- [nestjs/complete-app.ts](nestjs/complete-app.ts)
- [next/complete-app.ts](next/complete-app.ts): one file for reference; in a real app split into `lib/dropp.ts` and `app/api/media` routes

These use `JsonFileMediaRepository` + local disk on purpose so you can see the HTTP shape without a database.

## Run idea

- Express: `npx tsx examples/adapters/express/complete-app.ts`
- NestJS: import `bootstrap()` from the Nest file
- Next.js: copy the handlers into `app/api` as shown in the framework guide

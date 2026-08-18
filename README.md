# Dropp

Upload files, store them anywhere, and keep the metadata in your database.

Install `droppjs`, create one `Dropp` instance, call `attach()`. That is the whole product. Framework helpers, S3, Prisma, and plugins are optional add-ons around that one instance.

```ts
const media = await dropp.attach({
  file: buffer,
  fileName: "cover.jpg",
  mimeType: "image/jpeg",
  model: "posts",
  modelId: "42",
  collection: "cover",
});

media.url; // where the file can be loaded
media.id;  // persist this on your post if you want
```

Images, videos, audio, and documents all go through the same call.

---

## How it works

You always wire **two things**, then create Dropp:

| Piece | Job | Start with | Later switch to |
| --- | --- | --- | --- |
| **Repository** | Saves media rows (id, url, model, …) | `JsonFileMediaRepository` (a JSON file, no database) | Prisma, Drizzle, TypeORM, … |
| **Storage** | Saves the actual file bytes | `LocalStorageDriver` (disk) | S3, R2, Azure, GCS |

```ts
import { Dropp, JsonFileMediaRepository, LocalStorageDriver } from "droppjs";

export const dropp = new Dropp({
  repository: new JsonFileMediaRepository(".dropp/media.json"),
  storage: new LocalStorageDriver("uploads", "/uploads"),
});
```

That instance is what you use in Next.js, Express, NestJS, or a plain script. The framework adapters are thin HTTP helpers. They call `dropp.attach()` for you. You can also call `dropp.attach()` yourself and skip the helpers.

**`model` + `modelId` are required on every upload.** They answer “this file belongs to which record?” Example: a cover image for blog post `42` is `model: "posts"`, `modelId: "42"`.

---

## Install

```bash
npm install droppjs
npx dropp init
npx dropp doctor --verbose
```

Node.js 20+. `droppjs` is **server-only**. Do not import it from a React client component. Next.js will try to bundle `fs`, Sharp, and AWS SDK into the browser and fail.

`init` writes `dropp.config.json`. `doctor` checks that config before you go further.

---

## Use it in Next.js (App Router)

```bash
npx dropp generate:adapter next
```

That writes:

- `lib/dropp.ts`: the Dropp instance (server-only)
- `app/api/media/route.ts`: upload + list
- `app/api/media/[id]/route.ts`: get + delete
- `dropp.config.json`: local files go to `public/uploads`

Add `public/uploads` and `.dropp` to `.gitignore`. This is for local development. On Vercel, switch to S3 + Prisma before you ship (see below).

Upload field name is **`file`**. `lib/dropp.ts` must only be imported from Route Handlers, Server Components, and Server Actions.

### Upload from the browser

Do **not** import `droppjs` here. Use `fetch`.

`app/upload-cover.tsx`

```tsx
"use client";

export function UploadCover({ postId }: { postId: string }) {
  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);

    const response = await fetch(
      `/api/media?model=posts&modelId=${postId}&collection=cover`,
      { method: "POST", body },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const media = await response.json();
    console.log(media.url); // /uploads/posts/42/1710000000000-cover.jpg
  }

  return <input type="file" accept="image/*" onChange={onChange} />;
}
```

Show the file with a normal image tag: `<img src={media.url} alt="" />`.

### Confirm it works

CLI (uses the same config the generator just wrote):

```bash
npx dropp attach ./photo.jpg --model posts --modelId 42 --collection cover
npx dropp list --limit 10
```

Or through the Next.js route:

```bash
curl -F "file=@./photo.jpg" "http://localhost:3000/api/media?model=posts&modelId=42&collection=cover"
curl "http://localhost:3000/api/media?model=posts&modelId=42"
```

If either path returns JSON with `id` and `url`, Dropp is wired. Everything else is swapping storage or the database.

---

## Express / NestJS

```bash
npx dropp generate:adapter express   # writes dropp.express.ts
npx dropp generate:adapter nestjs    # writes dropp.module.ts
```

Wire those files into your app entrypoint. Full explanation: [docs/FRAMEWORK_GUIDE.md](docs/FRAMEWORK_GUIDE.md).

---

## Change where files are stored

Replace only `storage`. The rest of your app stays the same.

**S3**

```ts
import { S3StorageDriver } from "droppjs";

storage: new S3StorageDriver({
  bucket: process.env.S3_BUCKET!,
  region: process.env.S3_REGION!,
  publicBaseUrl: process.env.S3_PUBLIC_URL, // optional CDN / public URL
}),
```

Credentials come from the normal AWS environment (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

**Cloudflare R2**

```ts
import { R2StorageDriver } from "droppjs";

storage: new R2StorageDriver({
  accountId: process.env.R2_ACCOUNT_ID!,
  bucket: process.env.R2_BUCKET!,
  publicBaseUrl: process.env.R2_PUBLIC_URL,
}),
```

Also available: `AzureBlobStorageDriver`, `GCSStorageDriver`. See [docs/ADAPTERS.md](docs/ADAPTERS.md).

---

## Change where metadata is stored

`JsonFileMediaRepository` is fine for trying Dropp. For a real app, persist rows with your ORM.

```bash
npx dropp generate:all media --orm prisma
npx dropp migrate --orm prisma --mode dev
```

That writes the Prisma model, a `dropp.repository.ts` factory, a migration stub, and updates `dropp.config.json`. Then point `lib/dropp.ts` at Prisma:

```ts
import { PrismaClient } from "@prisma/client";
import { Dropp, PrismaMediaRepository, LocalStorageDriver } from "droppjs";

const prisma = new PrismaClient();

export const dropp = new Dropp({
  repository: new PrismaMediaRepository(prisma),
  storage: new LocalStorageDriver("public/uploads", "/uploads"),
});
```

Other ORMs: `npx dropp generate:all media --orm drizzle` (or `typeorm`, `sequelize`, `mikroorm`, `mongoose`, `kysely`). Details: [docs/ORM_GUIDE.md](docs/ORM_GUIDE.md).

---

## What “adapter” means

Three different things share that word. You do not need all of them.

| Kind | What it is | Do you need it? |
| --- | --- | --- |
| **Storage adapter** | Where bytes go (`LocalStorageDriver`, `S3StorageDriver`, …) | Yes: pick one |
| **Repository / ORM adapter** | Where rows go (`JsonFileMediaRepository`, `PrismaMediaRepository`, …) | Yes: pick one |
| **Framework adapter** | HTTP helpers (`handleUpload`, `droppAttachMiddleware`, `DroppService`) | No. Nice to have. `dropp.attach()` works without them |

That is the whole adapter story. There is no extra “Next.js plugin” to install.

---

## Production checklist

- Serverless (Vercel, AWS Lambda): use object storage (S3/R2/…) plus a real database. Local disk + JSON file will lose data.
- Keep `droppjs` on the server. Client uploads go through your API route.
- Always send `model` and `modelId`.
- Run `npx dropp doctor --verbose` if config/CLI setup looks wrong.

---

## Optional extras

Once uploads work, add these to the same `new Dropp({...})` call:

- **Images:** `transformer: new SharpTransformationDriver()` then pass `transformations` on `attach()` (resize, webp, thumbnail)
- **Plugins:** `plugins: [new WatermarkPlugin({ text: "© You" })]`
- **CLI:** attach, list, remove, optimize: see [docs/CLI_REFERENCE.md](docs/CLI_REFERENCE.md)

Feature recipes (replace, versions, batch, queries): [docs/COOKBOOK.md](docs/COOKBOOK.md).

---

## Docs

**Start here (you just did)**

- This README: install, Next.js, swap storage/ORM
- [Framework guide](docs/FRAMEWORK_GUIDE.md): full Next.js / Express / NestJS apps
- [Adapters](docs/ADAPTERS.md): every storage, ORM, and framework helper

**When you already have uploads working**

- [Cookbook](docs/COOKBOOK.md): attach, replace, versions, pagination, plugins
- [ORM guide](docs/ORM_GUIDE.md): Prisma and other databases
- [API reference](docs/API_REFERENCE.md): method signatures
- [CLI reference](docs/CLI_REFERENCE.md)
- [Plugin guide](docs/PLUGIN_GUIDE.md) / [Plugin development](docs/PLUGIN_DEVELOPMENT_GUIDE.md)

Working copies of the framework snippets live in [`examples/adapters`](examples/adapters).

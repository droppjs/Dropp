# droppjs

**A Node.js media library** for uploads, image management, and file storage.

Use it when you need product images for an ecommerce store, user uploads in a SaaS app, or a media management layer in Next.js, Express, or NestJS. One package handles the file, the metadata row, and optional resize/watermark.

```bash
npm install droppjs
npx dropp init
npx dropp generate:adapter next
```

Then upload with:

```ts
await dropp.attach({
  file: buffer,
  fileName: "product.jpg",
  mimeType: "image/jpeg",
  model: "products",
  modelId: "sku-1001",
  collection: "gallery",
});
```

`model` + `modelId` say which record owns the file. Required on every upload.

---

## What you can store

Images, videos, audio, and documents. Local disk for development. S3, Cloudflare R2, Azure Blob, or GCS in production. Metadata in a JSON file first, then Prisma, Drizzle, TypeORM, Sequelize, MikroORM, Mongoose, or Kysely.

---

## 5-minute Next.js setup

```bash
npx dropp generate:adapter next
```

Creates:

1. `lib/dropp.ts` (server only)
2. `app/api/media/route.ts` (upload + list)
3. `app/api/media/[id]/route.ts` (get + delete)

Upload field name: `file`.

Browser (do not import `droppjs` in a Client Component):

```tsx
"use client";

export function ProductImageUpload({ productId }: { productId: string }) {
  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    await fetch(
      `/api/media?model=products&modelId=${productId}&collection=gallery`,
      { method: "POST", body },
    );
  }

  return <input type="file" accept="image/*" onChange={onChange} />;
}
```

Check it:

```bash
npx dropp attach ./photo.jpg --model products --modelId sku-1001 --collection gallery
npx dropp list --limit 10
```

---

## Express and NestJS

```bash
npx dropp generate:adapter express
npx dropp generate:adapter nestjs
```

Details: [docs/FRAMEWORK_GUIDE.md](docs/FRAMEWORK_GUIDE.md)

---

## Storage (where the file goes)

```ts
import { S3StorageDriver, R2StorageDriver } from "droppjs";

new S3StorageDriver({
  bucket: process.env.S3_BUCKET!,
  region: process.env.S3_REGION!,
});

new R2StorageDriver({
  accountId: process.env.R2_ACCOUNT_ID!,
  bucket: process.env.R2_BUCKET!,
});
```

Also: `LocalStorageDriver`, `AzureBlobStorageDriver`, `GCSStorageDriver`.

On Vercel or Lambda, do not use local disk. Use S3 or R2 plus a database.

---

## Database (where the row goes)

```bash
npx dropp generate:all media --orm prisma
npx dropp migrate --orm prisma --mode dev
```

Then:

```ts
import { Dropp, PrismaMediaRepository, LocalStorageDriver } from "droppjs";
import { PrismaClient } from "@prisma/client";

const dropp = new Dropp({
  repository: new PrismaMediaRepository(new PrismaClient()),
  storage: new LocalStorageDriver("public/uploads", "/uploads"),
});
```

---

## Typical apps

| You are building | How Dropp fits |
| --- | --- |
| Ecommerce | Product gallery, variants, and cover images on `model: "products"` |
| SaaS | Per-tenant uploads with `tenantId` |
| CMS / blog | Cover images and attachments on posts |
| Next.js full-stack | App Router upload API in one command |

`droppjs` stays on the server. The browser posts `FormData` to your route.

---

## Commands

```bash
npx dropp init
npx dropp doctor --verbose
npx dropp generate:adapter next
npx dropp attach ./file.jpg --model products --modelId 1
npx dropp list
```

Full list: [docs/CLI_REFERENCE.md](docs/CLI_REFERENCE.md)

---

## More docs

- [Quick start](docs/QUICK_START.md)
- [Frameworks](docs/FRAMEWORK_GUIDE.md)
- [Adapters](docs/ADAPTERS.md)
- [Cookbook](docs/COOKBOOK.md)
- [ORM](docs/ORM_GUIDE.md)
- [API](docs/API_REFERENCE.md)

Node.js 20+. License: MIT. Issues: [github.com/droppjs/Dropp](https://github.com/droppjs/Dropp/issues)

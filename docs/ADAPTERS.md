# Adapters

“Adapter” in Dropp means one of three things. You always pick a **storage** adapter and a **repository** adapter. A **framework** adapter is optional.

```ts
new Dropp({
  repository: /* where rows go */,
  storage: /* where file bytes go */,
});
```

Local disk and every repository class come from `droppjs`. Cloud storage, image/video transforms, and AI tagging are subpath exports. Install the matching SDK only when you use that backend.

Generate instead of writing these by hand:

```bash
npx dropp generate:adapter next
npx dropp generate:all media --orm prisma
```

If you have not uploaded a file yet: [README](../README.md).

---

## 1. Storage: where the file goes

| Class | Import | Extra install |
| --- | --- | --- |
| `LocalStorageDriver` | `droppjs` | none |
| `S3StorageDriver` | `droppjs/s3` | `@aws-sdk/client-s3` |
| `R2StorageDriver` | `droppjs/r2` | `@aws-sdk/client-s3` |
| `AzureBlobStorageDriver` | `droppjs/azure` | `@azure/storage-blob` |
| `GCSStorageDriver` | `droppjs/gcs` | `@google-cloud/storage` |

### Local

```ts
import { LocalStorageDriver } from "droppjs";

new LocalStorageDriver(
  "public/uploads", // folder on disk
  "/uploads",       // URL prefix returned on media.url
);
```

In Next.js, using `public/uploads` + `/uploads` means the file is immediately requestable as `/uploads/...`.

### S3

```ts
import { S3StorageDriver } from "droppjs/s3";

new S3StorageDriver({
  bucket: process.env.S3_BUCKET!,
  region: process.env.S3_REGION!,
  publicBaseUrl: process.env.S3_PUBLIC_URL, // optional
});
```

Uses the default AWS SDK credential chain (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`, or an instance role).

### R2

```ts
import { R2StorageDriver } from "droppjs/r2";

new R2StorageDriver({
  accountId: process.env.R2_ACCOUNT_ID!,
  bucket: process.env.R2_BUCKET!,
  publicBaseUrl: process.env.R2_PUBLIC_URL,
});
```

### Azure / GCS

```ts
import { AzureBlobStorageDriver } from "droppjs/azure";
import { GCSStorageDriver } from "droppjs/gcs";

new AzureBlobStorageDriver({
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
  container: "media",
  publicBaseUrl: process.env.AZURE_PUBLIC_URL,
});

new GCSStorageDriver({
  bucket: process.env.GCS_BUCKET!,
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  publicBaseUrl: process.env.GCS_PUBLIC_URL,
});
```

Serverless hosts cannot keep `LocalStorageDriver` files. Use S3/R2/Azure/GCS there.

---

## 2. Repository: where the metadata row goes

| Class | Backend |
| --- | --- |
| `JsonFileMediaRepository` | JSON file (no database) |
| `PrismaMediaRepository` | Prisma |
| `TypeOrmMediaRepository` | TypeORM |
| `DrizzleMediaRepository` | Drizzle |
| `SequelizeMediaRepository` | Sequelize |
| `MikroOrmMediaRepository` | MikroORM |
| `MongooseMediaRepository` | Mongoose |
| `KyselyMediaRepository` | Kysely |

### JSON file (first run)

```ts
import { JsonFileMediaRepository } from "droppjs";

new JsonFileMediaRepository(".dropp/media.json");
```

### Prisma (typical app)

Add the `Media` model from [ORM_GUIDE.md](ORM_GUIDE.md), migrate, then:

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaMediaRepository } from "droppjs";

const prisma = new PrismaClient();
new PrismaMediaRepository(prisma);
```

The adapter expects a Prisma model named `Media` with the fields in the ORM guide. You pass your existing `PrismaClient`. Dropp does not create a second database connection of its own.

CLI `dropp.config` repository modules are only needed if you use the CLI against the same database. App code constructs the class directly, as above.

---

## 3. Framework: optional HTTP helpers

These do not store anything. They parse the request and call `dropp.attach()` / `get()` / `delete()`.

### Next.js

| Helper | Use |
| --- | --- |
| `handleUpload(request, { dropp, model, modelId, collection? })` | `POST` route, `formData` field `file` |
| `handleGetMedia(id, { dropp })` | `GET` one row |
| `handleDeleteMedia(id, { dropp })` | `DELETE` one row |
| `handleGetModelMedia(model, modelId, { dropp })` | `GET` all files for a record |

Do not import `droppjs` (including `useMediaUpload`) from a Client Component. Upload with `fetch` + `FormData` instead. Full files: [FRAMEWORK_GUIDE.md](FRAMEWORK_GUIDE.md).

### Express

| Helper | Use |
| --- | --- |
| `droppAttachMiddleware({ dropp, model, modelId, … })` | After `multer().single("file")`; sets `req.media` |
| `DroppController` | `getMedia`, `getModelMedia`, `deleteMedia` |
| `droppErrorHandler()` | Last middleware |

Multer must use `memoryStorage()` so the file is a `Buffer`.

### NestJS

| Helper | Use |
| --- | --- |
| `DroppService` | Injectable wrapper: `attach`, `get`, `getByModel`, `delete` |
| `NestDroppController` | Ready-made controller if you do not want to write one |

Provide `DroppService` with `useFactory: () => new DroppService(dropp)`.

---

## Putting it together

Local Next.js:

```ts
new Dropp({
  repository: new JsonFileMediaRepository(".dropp/media.json"),
  storage: new LocalStorageDriver("public/uploads", "/uploads"),
});
```

Production Next.js:

```ts
import { Dropp, PrismaMediaRepository } from "droppjs";
import { S3StorageDriver } from "droppjs/s3";

new Dropp({
  repository: new PrismaMediaRepository(prisma),
  storage: new S3StorageDriver({
    bucket: process.env.S3_BUCKET!,
    region: process.env.S3_REGION!,
  }),
});
```

Same `handleUpload` routes. Only the constructor arguments change.

---

## Rules that save time

- Always pass `model` and `modelId`
- One `Dropp` instance per process
- Keep helpers thin; keep `new Dropp({...})` in one file
- `droppjs` stays on the server

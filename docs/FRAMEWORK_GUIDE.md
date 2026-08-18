# Framework guide

Do not copy these files by hand. Generate them:

```bash
npx dropp init
npx dropp generate:adapter next      # or express / nestjs
npx dropp doctor --verbose
```

The rest of this page is what those commands write, so you can see how the HTTP layer calls `dropp.attach()`.

`droppjs` is server-only. Do not import it from a browser / Client Component.

---

## Next.js (App Router)

```bash
npx dropp generate:adapter next
```

Writes:

```
lib/dropp.ts
app/api/media/route.ts
app/api/media/[id]/route.ts
dropp.config.json
```

### `lib/dropp.ts`

```ts
import path from "node:path";
import { Dropp, JsonFileMediaRepository, LocalStorageDriver } from "droppjs";

export const dropp = new Dropp({
  repository: new JsonFileMediaRepository(
    path.join(process.cwd(), ".dropp", "media.json"),
  ),
  storage: new LocalStorageDriver(
    path.join(process.cwd(), "public", "uploads"),
    "/uploads",
  ),
});
```

Import this file only from Route Handlers, Server Components, and Server Actions.

### `app/api/media/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { handleUpload, handleGetModelMedia } from "droppjs";
import { dropp } from "@/lib/dropp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  const modelId = request.nextUrl.searchParams.get("modelId");
  const collection =
    request.nextUrl.searchParams.get("collection") ?? undefined;

  if (!model || !modelId) {
    return NextResponse.json(
      { error: "Pass model and modelId as query params" },
      { status: 400 },
    );
  }

  return handleUpload(request, { dropp, model, modelId, collection });
}

export async function GET(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  const modelId = request.nextUrl.searchParams.get("modelId");

  if (!model || !modelId) {
    return NextResponse.json(
      { error: "Pass model and modelId as query params" },
      { status: 400 },
    );
  }

  return handleGetModelMedia(model, modelId, { dropp });
}
```

The upload field name must be `file`.

### `app/api/media/[id]/route.ts`

```ts
import { handleGetMedia, handleDeleteMedia } from "droppjs";
import { dropp } from "@/lib/dropp";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return handleGetMedia(id, { dropp });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return handleDeleteMedia(id, { dropp });
}
```

### Browser upload (Client Component)

Do not import `droppjs` here.

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

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  return <input type="file" onChange={onChange} />;
}
```

### Server Component: load files for a record

```ts
import { dropp } from "@/lib/dropp";

export async function PostGallery({ postId }: { postId: string }) {
  const items = await dropp.getByModel("posts", postId);
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <img src={item.url} alt={item.fileName} />
        </li>
      ))}
    </ul>
  );
}
```

### Try it

```bash
curl -F "file=@./photo.jpg" \
  "http://localhost:3000/api/media?model=posts&modelId=42&collection=cover"
```

### Next.js notes

- `export const runtime = "nodejs"`: Edge cannot use local disk or Sharp.
- Local disk + `public/uploads` is for development. On Vercel use S3/R2 and a database.
- `handleUpload` / `useMediaUpload` live in `droppjs`. `useMediaUpload` also imports the server package, so prefer the `fetch` snippet above in Client Components.
- Next.js 15+ passes `params` as a `Promise`. Await it as shown.

Helpers: `handleUpload`, `handleGetMedia`, `handleDeleteMedia`, `handleGetModelMedia`.

---

## Express

```bash
npm install droppjs express multer
npx dropp generate:adapter express
```

That writes `dropp.express.ts`. Equivalent source:

```ts
import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import {
  Dropp,
  JsonFileMediaRepository,
  LocalStorageDriver,
  DroppController,
  droppAttachMiddleware,
  droppErrorHandler,
} from "droppjs";

const dropp = new Dropp({
  repository: new JsonFileMediaRepository(".dropp/media.json"),
  storage: new LocalStorageDriver("uploads", "/uploads"),
});

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const controller = new DroppController(dropp);

app.post(
  "/media/:model/:modelId",
  upload.single("file"),
  (req, res, next) =>
    droppAttachMiddleware({
      dropp,
      model: String(req.params.model),
      modelId: String(req.params.modelId),
      collection:
        typeof req.query.collection === "string"
          ? req.query.collection
         : undefined,
    })(req, res, next),
  (req: Request, res: Response) => {
    res.status(201).json({
      media: (req as Request & { media?: unknown }).media,
    });
  },
);

app.get("/media/:id", controller.getMedia.bind(controller));
app.get(
  "/media/model/:model/:modelId",
  controller.getModelMedia.bind(controller),
);
app.delete("/media/:id", controller.deleteMedia.bind(controller));
app.use(droppErrorHandler());

app.listen(3000);
```

```bash
curl -F "file=@./photo.jpg" http://localhost:3000/media/posts/42
```

Multer must use memory storage so Dropp receives a `Buffer`. After the middleware runs, the created row is on `req.media`.

---

## NestJS

```bash
npm install droppjs @nestjs/common @nestjs/core @nestjs/platform-express
npx dropp generate:adapter nestjs
```

That writes `dropp.module.ts`. Import `DroppModule` into your `AppModule`. Equivalent source:

Create Dropp once, provide `DroppService`, call `attach()` in your controller.

```ts
import { Module, Controller, Post, Get, Delete, Param, Query, UseInterceptors, UploadedFile, BadRequestException, NotFoundException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  Dropp,
  DroppService,
  JsonFileMediaRepository,
  LocalStorageDriver,
} from "droppjs";

const dropp = new Dropp({
  repository: new JsonFileMediaRepository(".dropp/media.json"),
  storage: new LocalStorageDriver("uploads", "/uploads"),
});

@Controller("media")
class MediaController {
  constructor(private readonly droppService: DroppService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string } | undefined,
    @Query("model") model?: string,
    @Query("modelId") modelId?: string,
    @Query("collection") collection?: string,
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    if (!model || !modelId) {
      throw new BadRequestException("model and modelId are required");
    }

    return this.droppService.attach({
      file: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      model,
      modelId,
      collection,
    });
  }

  @Get(":id")
  async getMedia(@Param("id") id: string) {
    const media = await this.droppService.get(id);
    if (!media) throw new NotFoundException("Media not found");
    return media;
  }

  @Get("model/:model/:modelId")
  getModelMedia(
    @Param("model") model: string,
    @Param("modelId") modelId: string,
  ) {
    return this.droppService.getByModel(model, modelId);
  }

  @Delete(":id")
  deleteMedia(@Param("id") id: string) {
    return this.droppService.delete(id);
  }
}

@Module({
  controllers: [MediaController],
  providers: [
    { provide: DroppService, useFactory: () => new DroppService(dropp) },
  ],
})
export class AppModule {}
```

`NestDroppController` is also exported if you want a ready-made controller. Most apps use `DroppService` and write their own routes, as above.

---

## Without helpers

Same instance, no framework adapter:

```ts
const media = await dropp.attach({
  file: buffer,
  fileName: "cover.jpg",
  mimeType: "image/jpeg",
  model: "posts",
  modelId: "42",
  collection: "cover",
});
```

That is enough for Server Actions, background jobs, and CLIs.

---

## Checklist

1. One `Dropp` instance for the process
2. File bytes as a `Buffer` / `Uint8Array` (multer memory storage, or `file.arrayBuffer()`)
3. `model` and `modelId` on every attach
4. `droppjs` only on the server
5. Object storage + a database before deploying to serverless

Runnable copies: [examples/adapters](../examples/adapters).

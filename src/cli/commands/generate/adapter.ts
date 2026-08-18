import { Args, Command, Flags } from "@oclif/core";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import type { DroppConfig } from "../../../types/index.js";

const FRAMEWORKS = ["next", "express", "nestjs"] as const;
type Framework = (typeof FRAMEWORKS)[number];

const NEXT_FILES: Array<{ path: string; contents: string }> = [
  {
    path: "lib/dropp.ts",
    contents: `import path from "node:path";
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
`,
  },
  {
    path: "app/api/media/route.ts",
    contents: `import { NextRequest, NextResponse } from "next/server";
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
`,
  },
  {
    path: "app/api/media/[id]/route.ts",
    contents: `import { handleGetMedia, handleDeleteMedia } from "droppjs";
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
`,
  },
];

const EXPRESS_FILE = `import express, { type Request, type Response } from "express";
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

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(\`Dropp Express API on http://localhost:\${port}\`);
});
`;

const NESTJS_FILE = `import {
  Module,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
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
export class MediaController {
  constructor(private readonly droppService: DroppService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  async upload(
    @UploadedFile()
    file:
      | { buffer: Buffer; originalname: string; mimetype: string }
      | undefined,
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
export class DroppModule {}
`;

export default class GenerateAdapter extends Command {
  static override description =
    "Generate framework upload files (Next.js, Express, or NestJS)";

  static override args = {
    framework: Args.string({
      description: "Framework to scaffold",
      required: true,
      options: FRAMEWORKS as unknown as string[],
    }),
  };

  static override flags = {
    force: Flags.boolean({
      char: "f",
      description: "Overwrite existing generated files",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GenerateAdapter);
    const framework = args.framework as Framework;

    if (framework === "next") {
      for (const file of NEXT_FILES) {
        const target = join(process.cwd(), file.path);
        await this.writeFile(target, file.contents, flags.force);
        this.log(`  ${file.path}`);
      }

      await this.patchNextConfig();
      this.log("");
      this.log("Next.js upload API is ready.");
      this.log("POST /api/media?model=posts&modelId=42  (form field: file)");
      this.log("Try: npx dropp attach ./photo.jpg --model posts --modelId 42");
      return;
    }

    if (framework === "express") {
      const target = join(process.cwd(), "dropp.express.ts");
      await this.writeFile(target, EXPRESS_FILE, flags.force);
      this.log(`  dropp.express.ts`);
      this.log("");
      this.log("Wire this file into your Express entrypoint, or run it with tsx.");
      return;
    }

    const target = join(process.cwd(), "dropp.module.ts");
    await this.writeFile(target, NESTJS_FILE, flags.force);
    this.log(`  dropp.module.ts`);
    this.log("");
    this.log("Import DroppModule from this file into your NestJS AppModule.");
  }

  private async writeFile(
    target: string,
    contents: string,
    force: boolean,
  ): Promise<void> {
    try {
      await access(target, constants.F_OK);
      if (!force) {
        throw new Error(`${target} already exists. Use --force to overwrite.`);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("already exists")
      ) {
        throw error;
      }
    }

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
  }

  private async patchNextConfig(): Promise<void> {
    const configPath = join(process.cwd(), "dropp.config.json");
    const config = await this.readOrCreateConfig(configPath);

    config.storage = {
      ...config.storage,
      driver: "local",
      local: {
        ...config.storage.local,
        baseDir: "public/uploads",
        baseUrl: "/uploads",
      },
    };

    if (config.orm.driver === "json" || !config.orm.driver) {
      config.orm = { driver: "json" };
    }

    await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
    this.log("  dropp.config.json");
  }

  private async readOrCreateConfig(path: string): Promise<DroppConfig> {
    try {
      await access(path, constants.F_OK);
      const raw = await readFile(path, "utf8");
      return JSON.parse(raw) as DroppConfig;
    } catch {
      return {
        orm: { driver: "json" },
        storage: {
          driver: "local",
          local: {
            baseDir: "public/uploads",
            baseUrl: "/uploads",
          },
        },
        queue: { enabled: false },
      };
    }
  }
}

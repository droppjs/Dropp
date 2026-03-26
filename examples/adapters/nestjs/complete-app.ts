/**
 * Complete NestJS application with Dropp media management
 *
 * Run: npm run start
 */

import {
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
import { NestFactory } from "@nestjs/core";
import { Dropp } from "@usedropp/core";
import { PrismaMediaRepository } from "@usedropp/db-prisma";
import { LocalStorageDriver } from "@usedropp/storage-local";
import { ImageTransformer } from "@usedropp/transformer-image";
import {
  DroppService,
  DroppController as DroppMediaController,
} from "@usedropp/adapter-nestjs";
import path from "path";

// ==========================================
// Services
// ==========================================

/**
 * DroppService - Provided by @usedropp/adapter-nestjs
 * Alternative: Create your own service by injecting Dropp instance
 */
@Module({})
export class MediaServiceModule {}

/**
 * Custom Dropp service example (alternative to provided service)
 */
export const createDroppInstance = (): Dropp => {
  return new Dropp({
    repository: new PrismaMediaRepository(),
    storage: new LocalStorageDriver({
      basePath: path.join(process.cwd(), "uploads"),
    }),
    transformer: new ImageTransformer(),
  });
};

// ==========================================
// Controllers
// ==========================================

/**
 * Media controller using provided DroppService from adapter
 * Using decorator-based approach with FileInterceptor
 */
@Controller("media")
export class MediaController {
  private dropp: Dropp;

  constructor() {
    this.dropp = createDroppInstance();
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("File type not allowed"));
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: any,
    @Query("model") model?: string,
    @Query("modelId") modelId?: string,
    @Query("collection") collection?: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    if (!model || !modelId) {
      throw new BadRequestException("model and modelId query params required");
    }

    try {
      const media = await this.dropp.attach({
        file: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        model,
        modelId,
        collection,
      });

      return {
        success: true,
        media,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  @Get(":id")
  async getMedia(@Param("id") id: string) {
    const media = await this.dropp.get(id);

    if (!media) {
      throw new NotFoundException("Media not found");
    }

    return media;
  }

  @Get("model/:model/:modelId")
  async getModelMedia(
    @Param("model") model: string,
    @Param("modelId") modelId: string,
  ) {
    return this.dropp.getByModel(model, modelId);
  }

  @Delete(":id")
  async deleteMedia(@Param("id") id: string) {
    await this.dropp.delete(id);
    return { success: true };
  }
}

/**
 * Alternative: Using provided DroppMediaController from adapter
 */
@Module({
  controllers: [DroppMediaController, MediaController],
})
export class MediaModule {}

// ==========================================
// Bootstrap
// ==========================================

@Module({
  imports: [MediaModule],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  console.log(`✓ NestJS server running on http://localhost:3000`);
  console.log(`  POST /media/upload?model=article&modelId=123 - Upload media`);
  console.log(`  GET /media/:id - Get media by ID`);
  console.log(`  GET /media/model/:model/:modelId - Get media by model`);
  console.log(`  DELETE /media/:id - Delete media`);

  // Alternative routes from adapter controller
  console.log(`  POST /media - Upload (from adapter)`);
}

// Run bootstrap
if (require.main === module) {
  bootstrap();
}

export { AppModule };

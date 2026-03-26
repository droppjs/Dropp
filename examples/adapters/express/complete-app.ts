/**
 * Complete Express application with Dropp media management
 * 
 * Run: npx ts-node complete-app.ts
 */

import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { Dropp } from "@dropp/core";
import { PrismaMediaRepository } from "@dropp/db-prisma";
import { LocalStorageDriver } from "@dropp/storage-local";
import { ImageTransformer } from "@dropp/transformer-image";
import { DroppController, droppAttachMiddleware, droppErrorHandler } from "@dropp/adapter-express";

const app = express();
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

const dropp = new Dropp({
  repository: new PrismaMediaRepository(),
  storage: new LocalStorageDriver({
    basePath: path.join(process.cwd(), "uploads"),
  }),
  transformer: new ImageTransformer(),
});

const validateModel = (req: Request, res: Response, next: NextFunction) => {
  const { model, modelId } = req.query;
  if (!model || !modelId) {
    return res.status(400).json({ error: "model and modelId query params required" });
  }
  next();
};

// ==========================================
// API Routes
// ==========================================

/**
 * POST /media - Upload media
 * Query params: model, modelId, collection (optional)
 */
app.post(
  "/media",
  validateModel,
  upload.single("file"),
  droppAttachMiddleware({
    dropp,
    model: (req) => req.query.model as string,
    modelId: (req) => req.query.modelId as string,
    collection: (req) => (req.query.collection as string) || undefined,
  }),
  (req: Request, res: Response) => {
    const media = (req as any).media;
    res.status(201).json({
      success: true,
      media,
    });
  },
);

/**
 * GET /media/:id - Get specific media by ID
 */
app.get("/media/:id", async (req: Request, res: Response) => {
  try {
    const media = await dropp.get(req.params.id);
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /media/model/:model/:modelId - Get all media for a model instance
 */
app.get("/media/model/:model/:modelId", async (req: Request, res: Response) => {
  try {
    const media = await dropp.getByModel(req.params.model, req.params.modelId);
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /media/:id - Delete media
 */
app.delete("/media/:id", async (req: Request, res: Response) => {
  try {
    await dropp.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ==========================================
// Example routes with DroppController helper
// ==========================================

const controller = new DroppController(dropp);

/**
 * GET /api/media/:id - Alternative using DroppController
 */
app.get("/api/media/:id", controller.getMedia.bind(controller));

/**
 * GET /api/media/model/:model/:modelId - Alternative using DroppController
 */
app.get("/api/media/model/:model/:modelId", controller.getModelMedia.bind(controller));

/**
 * DELETE /api/media/:id - Alternative using DroppController
 */
app.delete("/api/media/:id", controller.deleteMedia.bind(controller));

app.use(droppErrorHandler());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Express server running on http://localhost:${PORT}`);
  console.log(`  POST /media?model=article&modelId=123 - Upload media`);
  console.log(`  GET /media/:id - Get media by ID`);
  console.log(`  GET /media/model/:model/:modelId - Get media by model`);
  console.log(`  DELETE /media/:id - Delete media`);
});

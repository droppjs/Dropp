/**
 * Complete Next.js API routes with Dropp media management
 * 
 * Usage: Place these files in your Next.js app/api/media/ directory
 */

// ==========================================
// app/api/media/route.ts - POST/GET all media
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { handleUpload, handleGetModelMedia } from "@dropp/adapter-next";
import { dropp } from "@/lib/dropp"; // Your Dropp instance

/**
 * POST /api/media?model=article&modelId=123
 * Upload media for a model instance
 */
export async function POST(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  const modelId = request.nextUrl.searchParams.get("modelId");
  const collection = request.nextUrl.searchParams.get("collection") || undefined;

  if (!model || !modelId) {
    return NextResponse.json(
      { error: "model and modelId query params required" },
      { status: 400 },
    );
  }

  return handleUpload(request, {
    dropp,
    model,
    modelId,
    collection,
  });
}

/**
 * GET /api/media?model=article&modelId=123
 * Get all media for a model instance
 */
export async function GET(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  const modelId = request.nextUrl.searchParams.get("modelId");

  if (!model || !modelId) {
    return NextResponse.json(
      { error: "model and modelId query params required" },
      { status: 400 },
    );
  }

  return handleGetModelMedia(model, modelId, { dropp });
}

// ==========================================
// app/api/media/[id]/route.ts - GET/DELETE single
// ==========================================

import type { NextRequest } from "next/server";
import { handleGetMedia, handleDeleteMedia } from "@dropp/adapter-next";

export interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/media/[id]
 * Get specific media by ID
 */
export async function GET_SINGLE(
  request: NextRequest,
  { params }: PageParams,
) {
  const { id } = await params;
  return handleGetMedia(id, { dropp });
}

/**
 * DELETE /api/media/[id]
 * Delete media by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: PageParams,
) {
  const { id } = await params;
  return handleDeleteMedia(id, { dropp });
}

// ==========================================
// lib/dropp.ts - Initialize Dropp instance
// ==========================================

import path from "path";
import { Dropp } from "@dropp/core";
import { PrismaMediaRepository } from "@dropp/db-prisma";
import { LocalStorageDriver } from "@dropp/storage-local";
import { ImageTransformer } from "@dropp/transformer-image";

export const dropp = new Dropp({
  repository: new PrismaMediaRepository(),
  storage: new LocalStorageDriver({
    basePath: path.join(process.cwd(), "public/uploads"),
  }),
  transformer: new ImageTransformer(),
});

// ==========================================
// Client-side hook usage
// ==========================================

"use client"; // Client component directive

import { useMediaUpload } from "@dropp/adapter-next";

export function MediaUploadForm({ model, modelId }: { model: string; modelId: string }) {
  const { upload, deleteMedia } = useMediaUpload();
  const [loading, setLoading] = React.useState(false);
  const [media, setMedia] = React.useState<any[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await upload(file, model, modelId);
      setMedia((prev) => [...prev, result]);
      console.log("✓ Media uploaded:", result);
    } catch (error) {
      console.error("✗ Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await deleteMedia(mediaId);
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      console.log("✓ Media deleted");
    } catch (error) {
      console.error("✗ Delete failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Upload Media</label>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={loading}
          accept="image/*,video/mp4"
          className="block w-full"
        />
      </div>

      {media.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Uploaded Media</h3>
          {media.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2 border rounded">
              <span>{m.fileName}</span>
              <button
                onClick={() => handleDelete(m.id)}
                className="px-2 py-1 bg-red-500 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// React Server Component usage
// ==========================================

import { getMedia } from "@dropp/adapter-next";

interface MediaDisplayProps {
  mediaId: string;
}

export async function MediaDisplay({ mediaId }: MediaDisplayProps) {
  try {
    const media = await getMedia(mediaId);

    return (
      <div className="space-y-2">
        <h2>{media.fileName}</h2>
        {media.mimeType.startsWith("image/") && (
          <img src={media.url} alt={media.fileName} className="max-w-md" />
        )}
        {media.mimeType.startsWith("video/") && (
          <video src={media.url} controls className="max-w-md" />
        )}
        <p className="text-sm text-gray-500">
          Size: {(media.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    );
  } catch (error) {
    return <div className="text-red-500">Failed to load media</div>;
  }
}

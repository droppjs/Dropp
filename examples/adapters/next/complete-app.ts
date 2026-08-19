// @ts-nocheck
/**
 * Next.js + Dropp: consolidated reference.
 *
 * Copy into a real app as:
 *   lib/dropp.ts
 *   app/api/media/route.ts
 *   app/api/media/[id]/route.ts
 *
 * Step-by-step (including the Client Component upload):
 *   README.md and docs/FRAMEWORK_GUIDE.md
 *
 * Do not import droppjs from a "use client" file.
 */

import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import {
  Dropp,
  JsonFileMediaRepository,
  LocalStorageDriver,
  handleDeleteMedia,
  handleGetMedia,
  handleGetModelMedia,
  handleUpload,
} from "droppjs";
import { SharpTransformationDriver } from "droppjs/image";

export const dropp = new Dropp({
  repository: new JsonFileMediaRepository(
    path.join(process.cwd(), ".dropp", "media.json"),
  ),
  storage: new LocalStorageDriver(
    path.join(process.cwd(), "public", "uploads"),
    "/uploads",
  ),
  transformer: new SharpTransformationDriver(),
});

/**
 * Example for app/api/media/route.ts -> POST
 */
export async function POST_mediaRoute(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  const modelId = request.nextUrl.searchParams.get("modelId");
  const collection =
    request.nextUrl.searchParams.get("collection") ?? undefined;

  if (!model || !modelId) {
    return NextResponse.json(
      { error: "model and modelId query params required" },
      { status: 400 },
    );
  }

  return handleUpload(request, { dropp, model, modelId, collection });
}

/**
 * Example for app/api/media/route.ts -> GET
 */
export async function GET_mediaRoute(request: NextRequest) {
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

/**
 * Example for app/api/media/[id]/route.ts -> GET
 */
export async function GET_mediaByIdRoute(
  _request: NextRequest,
  context: { params: { id: string } },
) {
  return handleGetMedia(context.params.id, { dropp });
}

/**
 * Example for app/api/media/[id]/route.ts -> DELETE
 */
export async function DELETE_mediaByIdRoute(
  _request: NextRequest,
  context: { params: { id: string } },
) {
  return handleDeleteMedia(context.params.id, { dropp });
}

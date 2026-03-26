import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Dropp, JsonFileMediaRepository } from "../packages/core/dist/index.js";
import { LocalStorageDriver } from "../packages/storage/local/dist/index.js";

test("dedup returns same media for same content/scope", async () => {
  const base = join(process.cwd(), ".tmp-enterprise-dedup");
  await mkdir(base, { recursive: true });

  const repo = new JsonFileMediaRepository(join(base, "media.json"));
  const storage = new LocalStorageDriver(join(base, "files"));
  const dropp = new Dropp({ repository: repo, storage });

  const payload = new Uint8Array([1, 2, 3, 4]);

  const first = await dropp.attach({
    file: payload,
    fileName: "photo.png",
    mimeType: "image/png",
    model: "Post",
    modelId: "1",
    tenantId: "t1",
    collection: "images",
  });

  const second = await dropp.attach({
    file: payload,
    fileName: "photo.png",
    mimeType: "image/png",
    model: "Post",
    modelId: "1",
    tenantId: "t1",
    collection: "images",
  });

  assert.equal(first.id, second.id);
  await rm(base, { recursive: true, force: true });
});

test("versioning and rollback toggles active versions", async () => {
  const base = join(process.cwd(), ".tmp-enterprise-rollback");
  await mkdir(base, { recursive: true });

  const repo = new JsonFileMediaRepository(join(base, "media.json"));
  const storage = new LocalStorageDriver(join(base, "files"));
  const dropp = new Dropp({ repository: repo, storage });

  const v1 = await dropp.attach({
    file: new Uint8Array([10]),
    fileName: "doc.txt",
    mimeType: "text/plain",
    model: "Doc",
    modelId: "99",
    tenantId: "tenant-a",
    collection: "default",
  });

  const v2 = await dropp.attach({
    file: new Uint8Array([11]),
    fileName: "doc.txt",
    mimeType: "text/plain",
    model: "Doc",
    modelId: "99",
    tenantId: "tenant-a",
    collection: "default",
  });

  assert.equal(v2.metadata.version, 2);
  assert.equal(v2.metadata.previousVersionId, v1.id);

  const restored = await dropp.rollback(v2.id);
  assert.equal(restored.id, v1.id);

  const freshV1 = await repo.findById(v1.id);
  const freshV2 = await repo.findById(v2.id);

  assert.equal(freshV1?.metadata.active, true);
  assert.equal(freshV2?.metadata.active, false);

  await rm(base, { recursive: true, force: true });
});

test("resumable chunk checkpoint shape", async () => {
  const checkpointPath = join(process.cwd(), ".tmp-resumable-checkpoint.json");
  const checkpoint = {
    sourceFile: "fixtures/video.mp4",
    chunkSize: 1024,
    totalChunks: 3,
    uploadedChunks: [0, 1],
    assembled: false,
  };

  await writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2), "utf8");
  const raw = await readFile(checkpointPath, "utf8");
  const parsed = JSON.parse(raw);

  assert.equal(parsed.totalChunks, 3);
  assert.deepEqual(parsed.uploadedChunks, [0, 1]);
  await rm(checkpointPath, { force: true });
});

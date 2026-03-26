import { test } from "vitest";
import assert from "assert";
import { Dropp } from "@dropp/core";
import { JsonFileMediaRepository } from "@dropp/core";
import { LocalStorageDriver } from "@dropp/storage-local";
import { randomUUID } from "crypto";

test("Dropp.attach creates media with auto-id", async () => {
  const repo = new JsonFileMediaRepository("./test-db.json");
  const storage = new LocalStorageDriver({ baseDir: "./test-storage" });
  const dropp = new Dropp({ repository: repo, storage });

  const media = await dropp.attach({
    file: new Uint8Array([1, 2, 3]),
    fileName: "test.bin",
    mimeType: "application/octet-stream",
    model: "Article",
    modelId: "123",
  });

  assert(media.id, "Media should have id");
  assert(media.url, "Media should have url");
  assert.strictEqual(media.model, "Article");
  assert.strictEqual(media.modelId, "123");
});

test("Dropp.get retrieves media by id", async () => {
  const repo = new JsonFileMediaRepository("./test-db-2.json");
  const storage = new LocalStorageDriver({ baseDir: "./test-storage-2" });
  const dropp = new Dropp({ repository: repo, storage });

  const created = await dropp.attach({
    file: new Uint8Array([4, 5, 6]),
    fileName: "test2.bin",
    mimeType: "application/octet-stream",
    model: "Post",
    modelId: "456",
  });

  const retrieved = await dropp.get(created.id);
  assert.strictEqual(retrieved.id, created.id);
  assert.strictEqual(retrieved.model, "Post");
});

test("Dropp.delete removes media", async () => {
  const repo = new JsonFileMediaRepository("./test-db-3.json");
  const storage = new LocalStorageDriver({ baseDir: "./test-storage-3" });
  const dropp = new Dropp({ repository: repo, storage });

  const created = await dropp.attach({
    file: new Uint8Array([7, 8, 9]),
    fileName: "test3.bin",
    mimeType: "application/octet-stream",
    model: "Comment",
    modelId: "789",
  });

  const deleted = await dropp.delete(created.id);
  assert(deleted, "Should return deleted media");

  try {
    await dropp.get(created.id);
    assert.fail("Should have thrown");
  } catch {
    // Expected: media not found after deletion
  }
});

test("Dropp respects collection namespace", async () => {
  const repo = new JsonFileMediaRepository("./test-db-4.json");
  const storage = new LocalStorageDriver({ baseDir: "./test-storage-4" });
  const dropp = new Dropp({ repository: repo, storage });

  const m1 = await dropp.attach({
    file: new Uint8Array([10]),
    fileName: "col1.bin",
    mimeType: "application/octet-stream",
    model: "Article",
    modelId: "1",
    collection: "avatars",
  });

  const m2 = await dropp.attach({
    file: new Uint8Array([20]),
    fileName: "col2.bin",
    mimeType: "application/octet-stream",
    model: "Article",
    modelId: "1",
    collection: "banners",
  });

  assert.notStrictEqual(
    m1.url,
    m2.url,
    "Different collections should have different urls",
  );
});

test("Repository.findByModel filters by model reference", async () => {
  const repo = new JsonFileMediaRepository("./test-db-5.json");
  const storage = new LocalStorageDriver({ baseDir: "./test-storage-5" });
  const dropp = new Dropp({ repository: repo, storage });

  await dropp.attach({
    file: new Uint8Array([30]),
    fileName: "art1.bin",
    mimeType: "application/octet-stream",
    model: "Article",
    modelId: "100",
  });

  await dropp.attach({
    file: new Uint8Array([31]),
    fileName: "art2.bin",
    mimeType: "application/octet-stream",
    model: "Article",
    modelId: "100",
  });

  await dropp.attach({
    file: new Uint8Array([40]),
    fileName: "post1.bin",
    mimeType: "application/octet-stream",
    model: "Post",
    modelId: "200",
  });

  const articleMedia = await repo.findByModel("Article", "100");
  assert.strictEqual(articleMedia.length, 2, "Should find 2 articles");

  const postMedia = await repo.findByModel("Post", "200");
  assert.strictEqual(postMedia.length, 1, "Should find 1 post");
});

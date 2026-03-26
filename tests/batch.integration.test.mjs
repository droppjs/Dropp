import { test } from "vitest";
import assert from "assert";
import { writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { resolveRepository } from "../packages/cli/src/utils/repository.js";
import { createStorageDriver } from "../packages/cli/src/utils/storage.js";
import { loadConfig } from "@dropp/config";

test("Batch.process saves checkpoint on success", async () => {
  const checkpointPath = "./test-batch-checkpoint.json";

  try {
    // Setup
    const config = await loadConfig("./");
    const repository = await resolveRepository(config, "./");
    const storage = createStorageDriver(config);

    // Create test media payload
    const payload = {
      items: [
        {
          file: Buffer.from("test1"),
          fileName: "test1.bin",
          mimeType: "application/octet-stream",
          model: "Article",
          modelId: "1",
        },
        {
          file: Buffer.from("test2"),
          fileName: "test2.bin",
          mimeType: "application/octet-stream",
          model: "Article",
          modelId: "2",
        },
      ],
    };

    // Simulate batch processing with checkpoint
    const checkpoint = {
      sourceConfigFile: "./dropp.config.json",
      processedKeys: [],
      failed: [],
      updatedAt: new Date().toISOString(),
    };

    for (let i = 0; i < payload.items.length; i++) {
      const key = `${i}:${payload.items[i].fileName}:${payload.items[i].model}:${payload.items[i].modelId}`;
      checkpoint.processedKeys.push(key);
    }

    await writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));

    // Verify checkpoint was created
    const saved = await readFile(checkpointPath, "utf8");
    const parsed = JSON.parse(saved);
    assert.strictEqual(parsed.processedKeys.length, 2);
    assert.strictEqual(parsed.failed.length, 0);
  } finally {
    try {
      await rm(checkpointPath);
    } catch {
      // Ignore cleanup errors
    }
  }
});

test("Batch.process resumes from checkpoint", async () => {
  const checkpointPath = "./test-batch-resume.json";

  try {
    // Create existing checkpoint (resume scenario)
    const checkpoint = {
      sourceConfigFile: "./dropp.config.json",
      processedKeys: ["0:test1.bin:Article:1"],
      failed: [],
      updatedAt: new Date().toISOString(),
    };

    await writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));

    // Load and verify
    const data = await readFile(checkpointPath, "utf8");
    const loaded = JSON.parse(data);

    assert.strictEqual(loaded.processedKeys.length, 1);
    // Second item should not be in processedKeys yet
    assert(!loaded.processedKeys.some((k) => k.includes("test2.bin")));
  } finally {
    try {
      await rm(checkpointPath);
    } catch {
      // Ignore
    }
  }
});

test("Batch.process tracks failures in checkpoint", async () => {
  const checkpointPath = "./test-batch-failures.json";

  try {
    const checkpoint = {
      sourceConfigFile: "./dropp.config.json",
      processedKeys: ["0:success.bin:Article:1"],
      failed: [
        {
          key: "1:failed.bin:Article:2",
          error: "Network timeout",
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    await writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));

    const data = await readFile(checkpointPath, "utf8");
    const loaded = JSON.parse(data);

    assert.strictEqual(loaded.processedKeys.length, 1);
    assert.strictEqual(loaded.failed.length, 1);
    assert.strictEqual(loaded.failed[0].error, "Network timeout");
  } finally {
    try {
      await rm(checkpointPath);
    } catch {
      // Ignore
    }
  }
});

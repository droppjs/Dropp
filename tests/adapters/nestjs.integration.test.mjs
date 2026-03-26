import test from "node:test";
import assert from "node:assert/strict";
import {
  DroppService,
  DroppController,
} from "../../packages/adapters/nestjs/dist/index.js";

test("NestJS adapter service and controller upload/get/delete flow", async () => {
  const media = {
    id: "m1",
    model: "post",
    modelId: "1",
    collection: "default",
    fileName: "image.png",
    mimeType: "image/png",
    size: 123,
    disk: "default",
    path: "post/1/image.png",
    url: "/media/post/1/image.png",
    metadata: {},
    createdAt: new Date(),
  };

  const dropp = {
    attach: async () => media,
    get: async (id) => (id === "m1" ? media : null),
    getByModel: async () => [media],
    delete: async () => {},
  };

  const service = new DroppService(dropp);
  const controller = new DroppController(service);

  const uploaded = await controller.upload(
    {
      buffer: new Uint8Array([1, 2]),
      originalname: "image.png",
      mimetype: "image/png",
    },
    { model: "post", modelId: "1", collection: "default" },
  );

  assert.equal(uploaded.id, "m1");

  const fetched = await controller.getMedia("m1");
  assert.equal(fetched.id, "m1");

  const byModel = await controller.getModelMedia("post", "1");
  assert.equal(byModel.length, 1);

  await controller.deleteMedia("m1");
});

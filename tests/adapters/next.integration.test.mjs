import test from "node:test";
import assert from "node:assert/strict";
import {
  handleUpload,
  handleGetMedia,
  handleDeleteMedia,
  handleGetModelMedia,
} from "../../packages/adapters/next/dist/index.js";

test("Next adapter upload/get/delete flow", async () => {
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
    updatedAt: new Date(),
  };

  const dropp = {
    attach: async () => media,
    get: async (id) => (id === "m1" ? media : null),
    getByModel: async () => [media],
    delete: async () => {},
  };

  const form = new FormData();
  form.append(
    "file",
    new File([new Uint8Array([1, 2, 3])], "image.png", { type: "image/png" }),
  );

  const request = {
    formData: async () => form,
  };

  const uploadResponse = await handleUpload(request, {
    dropp,
    model: "post",
    modelId: "1",
  });
  assert.equal(uploadResponse.status, 201);

  const uploadBody = await uploadResponse.json();
  assert.equal(uploadBody.id, "m1");

  const getResponse = await handleGetMedia("m1", { dropp });
  assert.equal(getResponse.status, 200);

  const listResponse = await handleGetModelMedia("post", "1", { dropp });
  assert.equal(listResponse.status, 200);

  const listBody = await listResponse.json();
  assert.equal(Array.isArray(listBody), true);
  assert.equal(listBody.length, 1);

  const deleteResponse = await handleDeleteMedia("m1", { dropp });
  assert.equal(deleteResponse.status, 204);
});

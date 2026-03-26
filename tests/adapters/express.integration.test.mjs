import test from "node:test";
import assert from "node:assert/strict";
import { droppAttachMiddleware } from "../../packages/adapters/express/dist/index.js";

test("Express adapter upload middleware attaches media", async () => {
  const fakeMedia = { id: "m1", url: "/media/m1" };
  const dropp = {
    attach: async () => fakeMedia,
  };

  const middleware = droppAttachMiddleware({
    dropp,
    model: "post",
    modelId: "1",
  });

  const req = {
    file: {
      buffer: new Uint8Array([1, 2, 3]),
      originalname: "image.png",
      mimetype: "image/png",
    },
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  let nextError = undefined;
  let nextCalled = false;
  await middleware(req, res, (error) => {
    nextCalled = true;
    nextError = error;
  });

  assert.equal(nextCalled, true);
  assert.equal(nextError, undefined);
  assert.deepEqual(req.media, fakeMedia);
  assert.equal(res.statusCode, 200);
});

test("Express adapter upload middleware returns 400 when file missing", async () => {
  const dropp = {
    attach: async () => {
      throw new Error("should not be called");
    },
  };

  const middleware = droppAttachMiddleware({
    dropp,
    model: "post",
    modelId: "1",
  });

  const req = {};
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  let nextCalled = false;
  await middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "No file uploaded" });
});

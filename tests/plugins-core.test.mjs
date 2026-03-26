import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { PluginRegistry } from "../packages/plugins/core/dist/index.js";

describe("PluginRegistry", () => {
  let registry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  it("should register a plugin", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
    };

    registry.register(plugin);
    const retrieved = registry.get("test-plugin");

    assert.ok(retrieved, "Plugin should be registered");
    assert.strictEqual(retrieved.name, "test-plugin");
    assert.strictEqual(retrieved.version, "1.0.0");
  });

  it("should prevent duplicate plugin registration", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
    };

    registry.register(plugin);

    assert.throws(
      () => registry.register(plugin),
      /already registered/,
      "Should throw on duplicate registration",
    );
  });

  it("should unregister a plugin", () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
    };

    registry.register(plugin);
    registry.unregister("test-plugin");

    assert.strictEqual(
      registry.get("test-plugin"),
      undefined,
      "Plugin should be unregistered",
    );
  });

  it("should get all plugins", () => {
    const plugin1 = { name: "plugin-1", version: "1.0.0" };
    const plugin2 = { name: "plugin-2", version: "1.0.0" };

    registry.register(plugin1);
    registry.register(plugin2);

    const all = registry.getAll();
    assert.strictEqual(all.length, 2, "Should return 2 plugins");
  });

  it("should get enabled plugins only", () => {
    const plugin1 = { name: "plugin-1", version: "1.0.0" };
    const plugin2 = { name: "plugin-2", version: "1.0.0" };

    registry.register(plugin1, {}, true);
    registry.register(plugin2, {}, false);

    const enabled = registry.getEnabled();
    assert.strictEqual(enabled.length, 1, "Should return 1 enabled plugin");
    assert.strictEqual(enabled[0].name, "plugin-1");
  });

  it("should enable and disable plugins", () => {
    const plugin = { name: "test-plugin", version: "1.0.0" };

    registry.register(plugin, {}, false);

    let metadata = registry.get("test-plugin");
    assert.strictEqual(metadata.enabled, false);

    registry.setEnabled("test-plugin", true);

    metadata = registry.get("test-plugin");
    assert.strictEqual(metadata.enabled, true);
  });

  it("should update plugin configuration", () => {
    const plugin = { name: "test-plugin", version: "1.0.0" };

    registry.register(plugin, { key1: "value1" });
    registry.setConfig("test-plugin", { key2: "value2" });

    const metadata = registry.get("test-plugin");
    assert.deepStrictEqual(metadata.config, {
      key1: "value1",
      key2: "value2",
    });
  });

  it("should execute hooks across all enabled plugins", async () => {
    const executionOrder = [];

    const plugin1 = {
      name: "plugin-1",
      version: "1.0.0",
      afterUpload: async () => {
        executionOrder.push("plugin-1");
      },
    };

    const plugin2 = {
      name: "plugin-2",
      version: "1.0.0",
      afterUpload: async () => {
        executionOrder.push("plugin-2");
      },
    };

    registry.register(plugin1, {}, true);
    registry.register(plugin2, {}, true);

    await registry.executeHook("afterUpload", {});

    assert.deepStrictEqual(
      executionOrder,
      ["plugin-1", "plugin-2"],
      "All enabled plugins should execute in order",
    );
  });

  it("should skip disabled plugins during hook execution", async () => {
    const executionOrder = [];

    const plugin1 = {
      name: "plugin-1",
      version: "1.0.0",
      afterUpload: async () => {
        executionOrder.push("plugin-1");
      },
    };

    const plugin2 = {
      name: "plugin-2",
      version: "1.0.0",
      afterUpload: async () => {
        executionOrder.push("plugin-2");
      },
    };

    registry.register(plugin1, {}, true);
    registry.register(plugin2, {}, false);

    await registry.executeHook("afterUpload", {});

    assert.deepStrictEqual(
      executionOrder,
      ["plugin-1"],
      "Only enabled plugins should execute",
    );
  });

  it("should skip plugins without the hook", async () => {
    const executionOrder = [];

    const plugin1 = {
      name: "plugin-1",
      version: "1.0.0",
      afterUpload: async () => {
        executionOrder.push("plugin-1");
      },
    };

    const plugin2 = {
      name: "plugin-2",
      version: "1.0.0",
      beforeUpload: async () => {
        executionOrder.push("plugin-2");
      },
    };

    registry.register(plugin1, {}, true);
    registry.register(plugin2, {}, true);

    await registry.executeHook("afterUpload", {});

    assert.deepStrictEqual(
      executionOrder,
      ["plugin-1"],
      "Only plugins with hook should execute",
    );
  });

  it("should throw if hook execution fails", async () => {
    const plugin = {
      name: "test-plugin",
      version: "1.0.0",
      afterUpload: async () => {
        throw new Error("Test error");
      },
    };

    registry.register(plugin);

    assert.rejects(
      () => registry.executeHook("afterUpload", {}),
      /Test error/,
      "Should rethrow hook error",
    );
  });

  it("should clear all plugins", () => {
    const plugin1 = { name: "plugin-1", version: "1.0.0" };
    const plugin2 = { name: "plugin-2", version: "1.0.0" };

    registry.register(plugin1);
    registry.register(plugin2);

    registry.clear();

    assert.strictEqual(registry.getAll().length, 0, "All plugins cleared");
  });

  it("should handle missing plugin operations gracefully", () => {
    assert.throws(
      () => registry.setEnabled("nonexistent", true),
      /not found/,
      "Should throw on missing plugin for setEnabled",
    );

    assert.throws(
      () => registry.setConfig("nonexistent", {}),
      /not found/,
      "Should throw on missing plugin for setConfig",
    );
  });
});

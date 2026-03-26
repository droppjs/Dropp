# @droppjs/plugins-core

Core plugin system for Dropp media management. Provides the plugin interface, lifecycle hooks, and registry for managing media plugins.

## Features

- **Plugin Lifecycle Hooks**: `beforeUpload`, `afterUpload`, `beforeDelete`, `afterDelete`
- **Plugin Registry**: Centralized plugin management with enable/disable support
- **Configuration Validation**: Per-plugin configuration validation
- **Type Safety**: Full TypeScript support with plugin interfaces

## Installation

```bash
npm install @droppjs/plugins-core
# or
pnpm add @droppjs/plugins-core
```

## Core Concepts

### Plugin Interface

All plugins must implement the `MediaPlugin` interface:

```typescript
interface MediaPlugin {
  name: string;
  version?: string;
  description?: string;
  beforeUpload?(context: PluginContext): Promise<void>;
  afterUpload?(context: PluginContext): Promise<void>;
  beforeDelete?(context: PluginContext): Promise<void>;
  afterDelete?(context: PluginContext): Promise<void>;
  validate?(config: Record<string, any>): Promise<void>;
}
```

### Plugin Context

Plugins receive a `PluginContext` object with access to media metadata:

```typescript
interface PluginContext {
  media?: Media;
  file?: Buffer;
  fileName?: string;
  mimeType?: string;
  model?: string;
  modelId?: string;
  collection?: string;
  metadata?: Record<string, any>;
  transformations?: any[];
  [key: string]: any;
}
```

### Plugin Registry

Use `PluginRegistry` to manage plugins:

```typescript
import { PluginRegistry } from "@droppjs/plugins-core";

const registry = new PluginRegistry();

// Register a plugin
registry.register(myPlugin, {
  /* config */
});

// Enable/disable plugins
registry.setEnabled("plugin-name", false);

// Execute hooks across all enabled plugins
await registry.executeHook("afterUpload", context);

// Get plugin metadata
const plugin = registry.get("plugin-name");
const allPlugins = registry.getAll();
const enabledPlugins = registry.getEnabled();
```

## Usage with Dropp

Plugins are integrated into Dropp core and automatically executed during media lifecycle:

```typescript
import { Dropp } from "@droppjs/core";
import { WatermarkPlugin } from "@droppjs/plugin-watermark";
import { AITaggingPlugin } from "@droppjs/plugin-ai-tagging";

const dropp = new Dropp({
  repository,
  storage,
  plugins: [
    new WatermarkPlugin({ text: "© Company" }),
    new AITaggingPlugin({ apiKey: process.env.OPENAI_API_KEY }),
  ],
});

// Plugins execute automatically on attach
const media = await dropp.attach({
  file: imageBuffer,
  model: "Product",
  modelId: "123",
});
```

## Available Plugins

- **@droppjs/plugin-watermark** - Add text watermarks to images
- **@droppjs/plugin-ai-tagging** - Automatic image tagging using AI
- **@droppjs/plugin-seo** - SEO metadata generation

## Creating Custom Plugins

Implement the `MediaPlugin` interface:

```typescript
import type { MediaPlugin, PluginContext } from "@droppjs/plugins-core";

export class MyCustomPlugin implements MediaPlugin {
  name = "my-custom-plugin";
  version = "1.0.0";
  description = "My custom plugin description";

  async validate(config: Record<string, any>): Promise<void> {
    // Validate plugin configuration
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
  }

  async beforeUpload(context: PluginContext): Promise<void> {
    // Execute before media upload
    console.log(`Uploading: ${context.fileName}`);
  }

  async afterUpload(context: PluginContext): Promise<void> {
    // Execute after media upload
    if (!context.metadata) context.metadata = {};
    context.metadata.processedAt = new Date().toISOString();
  }

  async beforeDelete(context: PluginContext): Promise<void> {
    // Execute before media deletion
  }

  async afterDelete(context: PluginContext): Promise<void> {
    // Execute after media deletion
  }
}
```

## Error Handling

Plugins should throw descriptive errors. The registry wraps plugin errors with plugin name and hook information:

```typescript
async afterUpload(context: PluginContext): Promise<void> {
  try {
    await this.processMedia();
  } catch (error) {
    throw new Error(
      `Failed to process media: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
```

## License

MIT

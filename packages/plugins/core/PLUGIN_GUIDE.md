# Plugin System

Dropp supports a plugin architecture for extending media functionality through lifecycle hooks and custom processors.

## Overview

The plugin system enables developers to:

- Hook into media upload/delete lifecycle events
- Enrich media with computed metadata
- Transform media on-the-fly
- Validate configurations at registration time

## Core Concepts

### Plugin Interface

Every plugin implements the `MediaPlugin` interface:

```typescript
export interface MediaPlugin {
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

All hooks receive a `PluginContext` object:

```typescript
export interface PluginContext {
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

Plugins are managed through the `PluginRegistry`:

```typescript
import { PluginRegistry } from "@droppjs/plugins-core";

const registry = new PluginRegistry();
registry.register(plugin, config, enabled);
registry.executeHook("beforeUpload", context);
```

## Built-in Plugins

### Watermark Plugin

Add visual watermarks to images.

**Package:** `@droppjs/plugin-watermark`

**Installation:**

```bash
dropp plugin:install watermark
pnpm add @droppjs/plugin-watermark
```

**Configuration:**

```json
{
  "plugins": {
    "watermark": {
      "enabled": true,
      "config": {
        "text": "© My Brand",
        "position": "bottomRight",
        "opacity": 0.7,
        "fontSize": 24
      }
    }
  }
}
```

**Options:**

- `text` (string): Watermark text
- `position` (enum): `center | topLeft | topRight | bottomLeft | bottomRight`
- `opacity` (0-1): Watermark transparency
- `fontSize` (number): Text size in pixels

### AI Tagging Plugin

Automatically tag media using AI vision services.

**Package:** `@droppjs/plugin-ai-tagging`

**Installation:**

```bash
dropp plugin:install ai-tagging
pnpm add @droppjs/plugin-ai-tagging
```

**Configuration:**

```json
{
  "plugins": {
    "ai-tagging": {
      "enabled": true,
      "config": {
        "provider": "openai",
        "apiKey": "${OPENAI_API_KEY}",
        "maxTags": 10,
        "confidenceThreshold": 0.7
      }
    }
  }
}
```

**Options:**

- `provider` (enum): `openai | cloudvision | rekognition`
- `apiKey` (string): API key for the provider
- `maxTags` (number): Maximum tags to extract
- `confidenceThreshold` (0-1): Minimum confidence score

### SEO Plugin

Generate SEO-friendly metadata for images.

**Package:** `@droppjs/plugin-seo`

**Installation:**

```bash
dropp plugin:install seo
pnpm add @droppjs/plugin-seo
```

**Configuration:**

```json
{
  "plugins": {
    "seo": {
      "enabled": true,
      "config": {
        "generateAltText": true,
        "generateDescription": true,
        "addImageSitemap": true,
        "compressMetadata": false
      }
    }
  }
}
```

**Options:**

- `generateAltText` (boolean): Auto-generate alt text from filename
- `generateDescription` (boolean): Generate SEO description
- `addImageSitemap` (boolean): Include in image sitemaps
- `compressMetadata` (boolean): Compress metadata in JSON output

## Plugin Management

### List Plugins

```bash
dropp plugin:list
dropp plugin:list --json
```

### Install Plugin

```bash
dropp plugin:install <name> [--config '{"key": "value"}']
```

Available plugins:

- `watermark` - Add watermarks to images
- `ai-tagging` - Automatically tag media using AI
- `seo` - Generate SEO-friendly metadata

### Remove Plugin

```bash
dropp plugin:remove <name>
```

## Creating Custom Plugins

### 1. Implement the MediaPlugin Interface

```typescript
import type { MediaPlugin, PluginContext } from "@droppjs/plugins-core";

export class MyPlugin implements MediaPlugin {
  name = "my-plugin";
  version = "1.0.0";
  description = "My custom plugin";

  async beforeUpload(context: PluginContext): Promise<void> {
    // Validate or transform input
  }

  async afterUpload(context: PluginContext): Promise<void> {
    // Enrich metadata
    if (!context.metadata) context.metadata = {};
    context.metadata.processedBy = this.name;
  }

  async validate(config: Record<string, any>): Promise<void> {
    // Validate plugin configuration
    if (config.required && !config.required) {
      throw new Error("'required' config is mandatory");
    }
  }
}

export default MyPlugin;
```

### 2. Register in Code

```typescript
import { PluginRegistry } from "@droppjs/plugins-core";
import { MyPlugin } from "./MyPlugin";

const registry = new PluginRegistry();
const plugin = new MyPlugin();

registry.register(plugin, {
  customOption: "value",
});
```

### 3. Load from Config

```typescript
import dropp from "dropp.config.json";
import { PluginRegistry } from "@droppjs/plugins-core";

const registry = new PluginRegistry();

for (const [name, settings] of Object.entries(dropp.plugins ?? {})) {
  if (settings.enabled) {
    const PluginClass = await import(`@droppjs/plugin-${name}`);
    const plugin = new PluginClass.default();
    await plugin.validate?.(settings.config ?? {});
    registry.register(plugin, settings.config ?? {});
  }
}
```

## Metadata Enrichment

Plugins can enrich media metadata during upload:

```typescript
async afterUpload(context: PluginContext): Promise<void> {
  if (!context.metadata) context.metadata = {};

  context.metadata.myPlugin = {
    processedAt: new Date().toISOString(),
    tags: ["tag1", "tag2"],
    scores: { confidence: 0.95 }
  };
}
```

This metadata is automatically saved to the database through the MediaRepository.

## Hook Execution Order

1. **beforeUpload** - All plugins (in registration order)
2. File upload to storage
3. Transformation processing (if configured)
4. Database record creation
5. **afterUpload** - All plugins (in registration order)

On deletion:

1. **beforeDelete** - All plugins
2. File deleted from storage
3. Database record deleted
4. **afterDelete** - All plugins

## Error Handling

If a plugin hook throws an error, the entire operation fails:

```typescript
try {
  await registry.executeHook("beforeUpload", context);
} catch (error) {
  // Handle plugin error
  console.error(`Plugin failed: ${error.message}`);
}
```

## Best Practices

1. **Keep hooks fast** - Avoid long-running operations in hooks
2. **Validate early** - Use the `validate()` method to catch config errors
3. **Check media type** - Many plugins only apply to images/videos
4. **Use try-catch** - Plugins should handle their own errors gracefully
5. **Document options** - Clearly specify all configuration options
6. **Test thoroughly** - Test with various media types and configurations

## Configuration in dropp.config.json

```json
{
  "orm": { "driver": "prisma" },
  "storage": { "driver": "local" },
  "queue": { "enabled": false },
  "plugins": {
    "watermark": {
      "enabled": true,
      "config": {
        "text": "© 2024",
        "position": "bottomRight"
      }
    },
    "seo": {
      "enabled": true,
      "config": {
        "generateAltText": true
      }
    }
  }
}
```

## Publishing Plugins

To publish a custom plugin as an npm package:

1. Create package with `@droppjs/plugin-*` naming
2. Implement `MediaPlugin` interface
3. Export plugin class as default
4. Add to `@droppjs/plugins-core` peerDependency
5. Publish to npm registry

Users can then install with:

```bash
pnpm add your-plugin-package
dropp plugin:install your-plugin-name
```

# Plugin Guide

Add this after uploads already work. First-run setup: [README](../README.md).

Plugins let you add behavior (watermark, SEO, tags) without editing Dropp.

## Built-in plugins

- SEO: `import { SEOPlugin } from "droppjs"`
- Watermark: `npm i sharp` then `import { WatermarkPlugin } from "droppjs/watermark"`
- AI tagging: `npm i openai` then `import { AITaggingPlugin } from "droppjs/ai-tagging"`

## Manage plugins from CLI

- `dropp plugin:install <name>`
- `dropp plugin:list`
- `dropp plugin:remove <name>`

## Lifecycle hooks

- `beforeUpload`
- `afterUpload`
- `beforeDelete`
- `afterDelete`

Use hooks to validate inputs, enrich metadata, or trigger side effects.

## Config example

```json
{
  "plugins": {
    "watermark": {
      "enabled": true,
      "config": {
        "text": "© My Brand",
        "position": "bottomRight",
        "opacity": 0.7
      }
    }
  }
}
```

## Best practices

- Keep plugins focused on one clear responsibility
- Validate config on startup
- Keep upload-path hooks fast
- Fail with clear error messages

Your future teammate (possibly also you) will thank you.

## More details

- API reference: [API_REFERENCE.md](API_REFERENCE.md)
- CLI reference: [CLI_REFERENCE.md](CLI_REFERENCE.md)

# Plugin Guide

Plugins let you add custom behavior to Dropp without editing core code.

## Built-in plugins

- Watermark
- AI Tagging
- SEO

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

## More details

- Core plugin docs: [../packages/plugins/core/PLUGIN_GUIDE.md](../packages/plugins/core/PLUGIN_GUIDE.md)

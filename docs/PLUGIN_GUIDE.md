# Plugin Development Guide

Plugins let you add custom behavior without touching core code.

If Dropp is the engine, plugins are the safe upgrades.

## Plugin lifecycle hooks

- `beforeUpload`
- `afterUpload`
- `beforeDelete`
- `afterDelete`

Use these to validate, enrich metadata, or trigger side effects.

## Built-in plugins

- Watermark
- AI Tagging
- SEO

## Plugin commands

- `dropp plugin:install <name>`
- `dropp plugin:list`
- `dropp plugin:remove <name>`

## Authoring workflow

1. Create a new package under `packages/plugins/`
2. Implement the plugin interface from plugins core
3. Keep scope small (one job per plugin)
4. Keep hooks fast and predictable
5. Register plugin config in `dropp.config.json`

## Configuration example

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

## Good plugin behavior checklist

- Fail loudly on invalid config
- Avoid slow network calls in upload-critical hooks
- Keep output deterministic
- Log enough to debug, not enough to become a podcast

## Where to learn more

- [../packages/plugins/core/PLUGIN_GUIDE.md](../packages/plugins/core/PLUGIN_GUIDE.md)
- [ADAPTERS.md](ADAPTERS.md)
- [ORM_GUIDE.md](ORM_GUIDE.md)

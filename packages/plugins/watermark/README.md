# @dropp/plugin-watermark

Add text watermarks to image files with configurable position, opacity, and styling.

## Features

- **Text Watermarking**: Add customizable text watermarks to images
- **Position Control**: Support for 5 positions (center, topLeft, topRight, bottomLeft, bottomRight)
- **Opacity Control**: Adjustable watermark opacity (0-1)
- **Format Support**: JPEG, PNG, WebP output formats
- **Color Customization**: Hex colors or common color names
- **Automatic Processing**: Watermark applied during media upload

## Installation

```bash
npm install @dropp/plugin-watermark
# or
pnpm add @dropp/plugin-watermark
```

## Usage

### Basic Usage

```typescript
import { Dropp } from "@dropp/core";
import { WatermarkPlugin } from "@dropp/plugin-watermark";

const dropp = new Dropp({
  repository,
  storage,
  plugins: [
    new WatermarkPlugin({
      text: "© My Company",
      position: "bottomRight",
      opacity: 0.7,
      fontSize: 24,
    }),
  ],
});

// Watermark applied automatically
const media = await dropp.attach({
  file: imageBuffer,
  model: "Product",
  modelId: "123",
});
```

### Configuration Options

```typescript
interface WatermarkConfig {
  enabled?: boolean; // Enable/disable watermark (default: true)
  text?: string; // Watermark text (default: "© Dropp")
  position?: string; // Position: center, topLeft, topRight, bottomLeft, bottomRight
  opacity?: number; // Opacity: 0-1 (default: 0.7)
  fontSize?: number; // Font size in pixels (default: 24)
  color?: string; // Text color - hex or color name (default: "white")
  outputFormat?: string; // Output format: jpeg, png, webp (default: "png")
}
```

### Position Examples

```typescript
// Bottom right (default)
{ position: "bottomRight", text: "© Company" }

// Top left
{ position: "topLeft", text: "© Company" }

// Center
{ position: "center", text: "© Company" }

// Top right
{ position: "topRight", text: "© Company" }

// Bottom left
{ position: "bottomLeft", text: "© Company" }
```

### Color Examples

```typescript
// Hex colors
{
  color: "#FFFFFF";
} // White
{
  color: "#FF0000";
} // Red
{
  color: "#00FF00";
} // Green

// Named colors
{
  color: "white";
}
{
  color: "black";
}
{
  color: "red";
}
{
  color: "green";
}
{
  color: "blue";
}
{
  color: "yellow";
}
```

## Metadata

After watermark processing, the following metadata is added to the media:

```json
{
  "watermarked": true,
  "watermarkText": "© My Company",
  "watermarkPosition": "bottomRight",
  "watermarkOpacity": 0.7,
  "watermarkAppliedAt": "2024-03-26T10:30:00Z"
}
```

## Output Formats

The plugin can output watermarked images in different formats:

```typescript
// PNG (default, lossless)
{
  outputFormat: "png";
}

// JPEG (lossy, smaller file size)
{
  outputFormat: "jpeg";
}

// WebP (modern format, better compression)
{
  outputFormat: "webp";
}
```

## Error Handling

The plugin validates configuration and provides clear error messages:

```typescript
// Invalid opacity
new WatermarkPlugin({ opacity: 1.5 });
// Error: Watermark opacity must be between 0 and 1

// Invalid position
new WatermarkPlugin({ position: "invalid" });
// Error: Watermark position must be one of: center, topLeft, topRight, bottomLeft, bottomRight

// Invalid color
new WatermarkPlugin({ color: "invalid-color" });
// Error: Watermark color must be a valid hex color or color name
```

## Performance Considerations

- Watermarking is applied asynchronously during upload
- Image processing is done in-memory (suitable for images < 10MB)
- For very large images, consider adjusting fontSize to prevent performance issues
- Watermark processing adds ~100-500ms per image depending on size and complexity

## Supported Image Formats

- JPEG
- PNG
- WebP
- GIF (static only)
- TIFF
- BMP

## Dependencies

- **sharp**: Image processing library for watermark application

## License

MIT

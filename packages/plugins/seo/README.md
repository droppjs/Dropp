# @droppjs/plugin-seo

Automatically enrich media with SEO-friendly metadata including alt text generation, descriptions, and image sitemap support.

## Features

- **Alt Text Generation**: Automatic alt text from filename and collection
- **Description Generation**: SEO-friendly descriptions for all media
- **Image Sitemap Support**: Mark images for inclusion in XML sitemaps
- **Metadata Compression**: Optional metadata compression for large collections
- **Automatic Processing**: SEO metadata applied during media upload

## Installation

```bash
npm install @droppjs/plugin-seo
# or
pnpm add @droppjs/plugin-seo
```

## Usage

### Basic Usage

```typescript
import { Dropp } from "@droppjs/core";
import { SEOPlugin } from "@droppjs/plugin-seo";

const dropp = new Dropp({
  repository,
  storage,
  plugins: [
    new SEOPlugin({
      generateAltText: true,
      generateDescription: true,
      addImageSitemap: true,
    }),
  ],
});

// SEO metadata applied automatically
const media = await dropp.attach({
  file: imageBuffer,
  fileName: "mountain-landscape.jpg",
  model: "BlogPost",
  modelId: "article-123",
  collection: "Featured Images",
});

console.log(media.metadata.seo);
// {
//   altText: "Featured Images - Mountain Landscape",
//   description: "Image: mountain-landscape. Uploaded to Dropp media library...",
//   imageSitemap: true,
//   lastModified: "2024-03-26T10:30:00Z"
// }
```

### Configuration Options

```typescript
interface SEOConfig {
  enabled?: boolean; // Enable/disable plugin (default: true)
  generateAltText?: boolean; // Auto-generate alt text (default: true)
  generateDescription?: boolean; // Auto-generate description (default: true)
  addImageSitemap?: boolean; // Mark for image sitemap (default: true)
  compressMetadata?: boolean; // Compress metadata (default: false)
}
```

## Alt Text Generation

The plugin automatically generates descriptive alt text from:

1. Filename (cleaned and formatted)
2. Collection name (if available)
3. Proper case formatting

### Examples

| Filename                | Collection | Generated Alt Text             |
| ----------------------- | ---------- | ------------------------------ |
| `product-photo.jpg`     | Products   | `Products - Product Photo`     |
| `banner-hero-image.png` | Header     | `Header - Banner Hero Image`   |
| `thumbnail_small.jpg`   | Thumbnails | `Thumbnails - Thumbnail Small` |
| `image-2024.webp`       | (default)  | `Image 2024`                   |

## Description Generation

Generates SEO-friendly descriptions combining:

- Filename
- Dropp media library reference
- Date uploaded (in metadata)

### Format

```
Image: {filename}. Uploaded to Dropp media library for optimal image management and delivery.
```

### Examples

- `Image: product-photo. Uploaded to Dropp media library for optimal image management and delivery.`
- `Image: banner-hero. Uploaded to Dropp media library for optimal image management and delivery.`

## Image Sitemap Integration

Enable images in XML sitemaps:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/article/123</loc>
    <image:image>
      <image:loc>https://cdn.example.com/media/abc123.jpg</image:loc>
      <image:title>Product Photo</image:title>
      <image:caption>Products - Product Photo</image:caption>
    </image:image>
  </url>
</urlset>
```

## Metadata Output

After SEO processing:

```json
{
  "seo": {
    "altText": "Featured Images - Mountain Landscape",
    "description": "Image: mountain-landscape. Uploaded to Dropp media library for optimal image management and delivery.",
    "imageSitemap": true,
    "lastModified": "2024-03-26T10:30:00Z"
  },
  "seoProcessedAt": "2024-03-26T10:30:00Z"
}
```

## Advanced Configuration

### Strict SEO Mode

```typescript
new SEOPlugin({
  generateAltText: true,
  generateDescription: true,
  addImageSitemap: true,
  compressMetadata: false, // Keep full metadata
});
```

### Minimal SEO Mode

```typescript
new SEOPlugin({
  generateAltText: true,
  generateDescription: false,
  addImageSitemap: false,
  compressMetadata: true, // Compress for storage
});
```

### Disabled

```typescript
new SEOPlugin({
  enabled: false,
});
```

## Supported Image Types

The plugin processes images with the following MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`
- `image/tiff`
- `image/x-bmp`

## SEO Best Practices

### Alt Text

- ✅ Descriptive and concise (5-10 words)
- ✅ Include context from collection
- ✅ Avoid keyword stuffing
- ❌ Don't say "image of" or "picture of"
- ❌ Don't use generic names

### Collections

Use meaningful collection names:

- ✅ `Featured Images`, `Product Gallery`, `Blog Assets`
- ❌ `images`, `files`, `media`

### Filenames

Use descriptive filenames:

- ✅ `mountain-landscape-sunset.jpg`
- ✅ `product-photo-angle-view.jpg`
- ❌ `image1.jpg`, `photo.jpg`, `IMG_1234.jpg`

## Implementation Details

### Alt Text Algorithm

1. Extract filename without extension
2. Replace hyphens/underscores with spaces
3. Convert to Title Case
4. Prepend collection name if available

### Description Algorithm

1. Use generated alt text (if enabled)
2. Append Dropp media library reference
3. Include upload timestamp (from metadata)

## Performance

- **Processing time**: < 10ms per image (metadata only)
- **Memory usage**: Minimal (no image processing)
- **Scalability**: Suitable for large media collections
- **No external dependencies**: Pure text generation

## Error Handling

The plugin validates configuration:

```typescript
// Invalid boolean values
new SEOPlugin({ generateAltText: "yes" });
// Error: SEO config generateAltText must be boolean

// All errors are caught and configuration is validated
```

## Integrating with Search Engines

### Google Search Console

1. Generate XML sitemap including image:image tags
2. Submit to Google Search Console
3. Monitor image search performance in GSC
4. Track image impressions and clicks

### Robots.txt

```
User-agent: *
Allow: /media/*

Sitemap: https://example.com/sitemap.xml
```

## Database Schema Recommendation

Store SEO data in media metadata:

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY,
  metadata JSONB,
  -- metadata contains: { seo: {...}, seoProcessedAt: ... }
)

CREATE INDEX idx_media_seo ON media USING GIN(metadata -> 'seo');
```

## Caching Considerations

- Alt text: Cache at application level (rarely changes)
- Description: Cache at CDN level (static text)
- Image sitemap: Regenerate daily or on-demand

## Accessibility Benefits

- Improved screen reader experience
- Better context for visually impaired users
- Enhanced usability for all users
- WCAG 2.1 AA compliance support

## License

MIT

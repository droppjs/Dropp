# @dropp/plugin-ai-tagging

Automatically tag images and videos using OpenAI's Vision API. Extracts meaningful labels and content descriptions with confidence scores.

## Features

- **AI-Powered Tagging**: Uses OpenAI Vision API for intelligent image analysis
- **Automatic Processing**: Tags applied during media upload
- **Confidence Scoring**: Each tag includes a confidence score (0-1)
- **Configurable Thresholds**: Filter tags by minimum confidence level
- **Tag Limiting**: Control maximum number of tags extracted
- **Metadata Enrichment**: Automatically add tags to media metadata

## Installation

```bash
npm install @dropp/plugin-ai-tagging
# or
pnpm add @dropp/plugin-ai-tagging
```

## Setup

### 1. Get OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Create an API key in [API keys section](https://platform.openai.com/api-keys)
3. Set `OPENAI_API_KEY` environment variable or pass as config

### 2. Configure Plugin

```typescript
import { Dropp } from "@dropp/core";
import { AITaggingPlugin } from "@dropp/plugin-ai-tagging";

const dropp = new Dropp({
  repository,
  storage,
  plugins: [
    new AITaggingPlugin({
      apiKey: process.env.OPENAI_API_KEY,
      maxTags: 10,
      confidenceThreshold: 0.7,
      model: "gpt-4-vision-preview",
    }),
  ],
});
```

## Usage

### Basic Usage

```typescript
// Tags applied automatically during attach
const media = await dropp.attach({
  file: imageBuffer,
  model: "Product",
  modelId: "123",
});

// Access tags in metadata
console.log(media.metadata.aiTags);
// ["nature", "landscape", "outdoor"]

console.log(media.metadata.aiTagsWithConfidence);
// [
//   { label: "nature", confidence: 0.95 },
//   { label: "landscape", confidence: 0.92 },
//   { label: "outdoor", confidence: 0.88 }
// ]
```

### Configuration Options

```typescript
interface AITaggingConfig {
  enabled?: boolean; // Enable/disable tagging (default: true)
  provider?: "openai"; // Only OpenAI supported
  apiKey?: string; // OpenAI API key (defaults to OPENAI_API_KEY env var)
  maxTags?: number; // Max tags to extract (default: 10)
  confidenceThreshold?: number; // Min confidence 0-1 (default: 0.7)
  model?: string; // Vision model to use
}
```

### Advanced Configuration

```typescript
// Strict tagging - only high-confidence tags
new AITaggingPlugin({
  apiKey: process.env.OPENAI_API_KEY,
  maxTags: 5,
  confidenceThreshold: 0.85, // Only 85%+ confidence tags
});

// Lenient tagging - more tags with lower threshold
new AITaggingPlugin({
  apiKey: process.env.OPENAI_API_KEY,
  maxTags: 20,
  confidenceThreshold: 0.5, // 50%+ confidence tags
});

// Disable temporarily
new AITaggingPlugin({
  enabled: false,
});
```

## Metadata

After AI tagging, the following metadata is added:

```json
{
  "aiTags": ["nature", "landscape", "outdoor"],
  "aiTagsWithConfidence": [
    { "label": "nature", "confidence": 0.95 },
    { "label": "landscape", "confidence": 0.92 },
    { "label": "outdoor", "confidence": 0.88 }
  ],
  "aiProvider": "openai",
  "aiModel": "gpt-4-vision-preview",
  "aiTaggedAt": "2024-03-26T10:30:00Z"
}
```

## Tag Examples

### Product Photography

```
["product", "electronics", "device", "portable", "modern"]
```

### Nature Photography

```
["landscape", "mountain", "nature", "outdoor", "scenic"]
```

### People Photography

```
["portrait", "people", "person", "indoor", "formal"]
```

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional - can be set in config instead
OPENAI_MODEL=gpt-4-vision-preview
```

## Error Handling

The plugin validates configuration and handles API errors gracefully:

```typescript
// Missing API key
new AITaggingPlugin({});
// Error: OpenAI API key required (set OPENAI_API_KEY env var)

// Invalid confidence threshold
new AITaggingPlugin({ confidenceThreshold: 1.5 });
// Error: AI tagging confidenceThreshold must be between 0 and 1

// API unavailable
// Plugin throws: AI tagging failed: API request failed
```

## Cost Considerations

- **Per-image cost**: ~0.01-0.03 USD (varies by image size)
- **High volume**: Consider implementing caching or batching
- **Budget limits**: Set spending limits in OpenAI account settings
- **Rate limiting**: OpenAI API has rate limits; implement backoff for large batches

## Performance

- **Processing time**: ~1-3 seconds per image
- **Async operation**: Non-blocking, happens during upload
- **Timeout**: 30 second timeout per image
- **Scalability**: Suitable for typical web applications; consider async queue for high-volume processing

## Supported Media Types

- **Images**: JPEG, PNG, GIF, WebP, TIFF, BMP
- **Videos**: Currently image-only (extract frame and analyze)

## Rate Limits

OpenAI has the following rate limits:

- **RPM** (Requests Per Minute): 500 RPM for GPT-4 Vision
- **TPM** (Tokens Per Minute): 30,000 TPM

For high-volume usage, consider:

1. Using a queue system to batch requests
2. Implementing exponential backoff
3. Caching frequently-analyzed images

## Tips for Best Results

1. **Clear images**: Better lighting and focus improve tagging accuracy
2. **Relevant objects**: Ensure main subject is visible and clear
3. **Appropriate threshold**: 0.7 is good default; adjust based on needs
4. **Max tags**: 10-15 tags is typical; more tags = lower confidence per tag

## Limitations

- Vision API has image size limits (5MB max)
- Real-time face recognition not supported
- EXIF data not used for tagging
- Language-specific content may vary in accuracy

## Dependencies

- **openai**: OpenAI API client library

## License

MIT

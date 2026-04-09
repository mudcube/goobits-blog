# Nano Banana Image Generation

Google Gemini 2.5 Flash Image integration for project image generation.

## Setup

Get an API key from Google AI Studio and add one of these to your local environment:

```bash
GOOGLE_API_KEY=your_actual_api_key_here
# or
GEMINI_API_KEY=your_actual_api_key_here
```

## Command Line

```bash
pnpm task:nano-banana "A jar of honey in sunlight"
pnpm task:nano-banana --aspect-ratio 16:9 "A wide landscape with mountains"
pnpm task:nano-banana -o ./static/images/generated "A realistic honeycomb"
pnpm task:nano-banana --no-style "A minimalist honey jar"
pnpm task:nano-banana --prompt-file prompts.txt
pnpm task:nano-banana --capabilities
pnpm task:nano-banana "Test prompt" --dry-run --json
```

Generated files default to `static/images/nano-banana`.

## Programmatic Usage

```js
import NanoBananaClient from './tasks/nano-banana/nano_banana_client.js'

const client = new NanoBananaClient()

const result = await client.generateImage({
	prompt: 'A jar of honey in sunlight',
	aspectRatio: '1:1',
	outputDir: './static/images/generated'
})

console.log(`Image saved to: ${ result.path }`)
```

## Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--prompt` | `-p` | string | - | The image prompt |
| `--prompt-file` | `-f` | string | - | Path to file with prompt |
| `--output-dir` | `-o` | string | `static/images/nano-banana` | Output directory |
| `--aspect-ratio` | `-a` | string | `1:1` | Aspect ratio |
| `--resolution` | `-r` | string | `1K` | Resolution |
| `--style` | `-s` | string | `whimsy` | Style preset |
| `--no-style` | - | boolean | `false` | Skip style prompt |
| `--url-only` | `-u` | boolean | `false` | Return base64 only |
| `--dry-run` | `-d` | boolean | `false` | Preview settings without generating |
| `--json` | `-j` | boolean | `false` | Output JSON |
| `--capabilities` | `-c` | boolean | `false` | Show capabilities |
| `--help` | `-h` | boolean | `false` | Show help |

## Styles

Core presets:

- `storybook`
- `product`
- `photo`
- `hero`

Legacy aliases:

- `whimsy` maps to `storybook`
- `realistic` maps to `product`
- `minimal` maps to `photo`

Each style includes anti-frame instructions so borders, frames, vignettes, and margins are not baked into generated images.

## Aspect Ratios

Supported aspect ratios:

- `1:1`
- `2:3`
- `3:2`
- `3:4`
- `4:3`
- `4:5`
- `5:4`
- `9:16`
- `16:9`
- `21:9`

## Files

- `nano_banana_provider.js` - MCP-style provider implementation
- `nano_banana_client.js` - Client wrapper
- `nano_banana_cli.js` - CLI tool
- `config.js` - Style and generation settings
- `shared/utils.js` - MCP response and filename helpers

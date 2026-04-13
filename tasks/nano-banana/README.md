# Nano Banana Image Task

Repo-local tooling for generating public image assets with Google Gemini 2.5 Flash Image.

Use this when a page needs a bespoke image and a hand-built SVG or existing asset is not the right fit. The task writes PNGs under `static/media/generated/nano-banana` by default, which keeps generated assets in the same public asset tree as the rest of this app.

## Setup

Provide an API key at runtime. Do not commit keys.

```bash
export GOOGLE_API_KEY='...'
# or
export GEMINI_API_KEY='...'
```

The task also reads `config/env/.env` and `.env` when present.

## CLI

```bash
pnpm task:nano-banana "A jar of honey in sunlight"
pnpm task:nano-banana --style hero --aspect-ratio 16:9 "A wide storybook header"
pnpm task:nano-banana --style product --resolution 2K "A clean product shot of a honey jar"
pnpm task:nano-banana --reference-image static/media/generated/nano-banana/apps-upscaled/project-sketchpad-upscaled.png --no-style "Use the supplied image as the base composition, preserve the subject and overall design, and improve clarity, finish, and polish for a premium software card illustration"
pnpm task:nano-banana --prompt-file tasks/nano-banana/prompts/home-hero.txt
pnpm task:nano-banana "A test prompt" --dry-run --json
```

Useful options:

| Option | Default | Notes |
|--------|---------|-------|
| `--style` | `whimsy` | `storybook`, `product`, `photo`, `hero`, plus legacy aliases |
| `--aspect-ratio` | `1:1` | Supports `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` |
| `--resolution` | `1K` | Supports `1K`, `2K`, `4K` |
| `--output-dir` | `static/media/generated/nano-banana` | Must stay inside the repo |
| `--filename` | generated from prompt | Writes a `.png` |
| `--reference-image` | none | Repo-local PNG/JPG/WEBP/GIF input for image-to-image generation |
| `--no-style` | off | Sends only the raw prompt |
| `--output base64` | `file` | Returns base64 instead of writing a file |
| `--capabilities` | off | Prints supported settings without requiring an API key |

`--url-only` is kept as an alias for `--output base64` for compatibility with the first version of this task. Gemini returns base64 image data, not a hosted URL.

## Programmatic Use

```js
import { NanoBananaClient } from './tasks/nano-banana/index.js'

const client = new NanoBananaClient()

const image = await client.generateImage({
	prompt: 'A wide storybook illustration of a honey harvest',
	style: 'hero',
	aspectRatio: '16:9',
	referenceImage: 'static/media/source/honey-harvest-sketch.png',
	filename: 'honey-harvest-hero'
})

console.log(image.relativePath)
```

## Repo Notes

Generated files are public SvelteKit static assets. Review the output before committing it, and move final assets closer to their page or feature if a more specific asset directory exists.

When using `--reference-image`, be explicit about what should remain stable from the source image and what should improve. A good pattern is: preserve subject/composition/identity, improve clarity/finish/materials/lighting, and avoid introducing new unrelated elements.

The style presets include anti-frame instructions so Gemini does not bake borders, frames, vignettes, or margins into images. Framing should stay in CSS.

Current files:

- `cli.js` - command-line entrypoint used by `pnpm task:nano-banana`
- `client.js` - small public API for scripts
- `provider.js` - Gemini API integration, retry handling, and file writing
- `config.js` - model, style, aspect ratio, and output defaults
- `utils.js` - path, filename, prompt-file, and response helpers
- `index.js` - exports for programmatic use

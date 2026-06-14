# miko-art
Personal website built with **SvelteKit 5** and deployed to **Cloudflare Pages**.

## Key Features
- **Journal and blog** - Public writing surfaces with RSS and sitemap support.
- **Portfolio pages** - Art, music, apps, and labs.
- **Contact flow** - Cloudflare Pages function endpoint with anti-abuse controls.
- **Themes** - `default`, `dark`, and `magic`.

## Quick Start
```bash
# Requirements
node --version    # Node.js 22+
pnpm --version    # pnpm 10+

pnpm install

# Dev server (http://localhost:3610)
pnpm dev

# Dev server with the local Cloudflare runtime
pnpm dev:wrangler
```

## Configuration
```bash
# View the available env vars
ls -la config/env/.env.example

# Edit miko.art local dev secrets (encrypted at rest via dotenvx)
pnpm exec dotenvx decrypt -f config/env/.env
# edit config/env/.env
pnpm exec dotenvx encrypt -f config/env/.env
```

### Path Aliases
Defined in `svelte.config.js`:

| Alias | Path |
|---|---|
| `@components` | `./src/components` |
| `@config` | `./src/config` |
| `@lib` | `./src/lib` |
| `@media` | `./src/media` |
| `@packages` | `./packages` |
| `@routes` | `./src/routes` |
| `@src` | `./src` |
| `@static` | `./static` |

## Testing & Code Quality
```bash
# Types + svelte-check + eslint + circular deps
pnpm check

# Repo checks + full e2e suite
pnpm test

# Direct full e2e suite
pnpm test:e2e

# High-signal subset (CI gate)
pnpm e2e:critical
```

## Deployment
```bash
# Standard deploy (build + Pages deploy)
pnpm deploy:prod

# Full deploy (push secrets + build + deploy)
pnpm deploy:prod:full
```

## Documentation
- **`AGENTS.md`** - Repo architecture notes and command map

## Related Packages
- **`packages/auth`** - Auth library used by this repo (its own README + tests)

## License

Proprietary. Copyright (c) 2026 Goobits. All rights reserved. See [`LICENSE`](./LICENSE).

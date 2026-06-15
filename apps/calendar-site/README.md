# calendar-site

Standalone SvelteKit calendar site for `pdx.fun`.

This folder is prepared to move out of the `miko-art` repository as its own repo.
It includes the app, local workspace packages, migrations, env templates, deploy
helpers, release docs, and tests needed to run without the parent checkout.

## Move

Copy or move the `apps/calendar-site` directory to the new repository root.
Generated folders are intentionally excluded and should be recreated after the
move:

- `node_modules/`
- `.svelte-kit/`
- `.wrangler/`
- `.dev/`

## Setup

```bash
pnpm install
cp config/env/.env.example config/env/.env
cp config/env/.env.production.example config/env/.env.production
```

Fill in local and production env values before running sync, deploy, OAuth, or
payment flows.

## Commands

```bash
pnpm dev
pnpm check
pnpm build
pnpm test
pnpm test:e2e
pnpm audit:boundaries
pnpm calendar:sync
pnpm deploy:secrets
```

## Included Packages

- `packages/calendar/*` - app, core, kit, migrations, theme, and UI.
- `packages/auth` - auth runtime used by the calendar app.
- `packages/security` - Turnstile, rate limit, and related security helpers.
- `packages/ui` - shared Svelte UI primitives used by the app.

The package copies are vendored so this folder can be moved first. They can be
replaced with published package versions later.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (port 3610)
pnpm dev:stop     # Stop dev server
pnpm dev:restart  # Restart dev server
pnpm build        # Production build
pnpm build:patch  # Patch bump + build
pnpm check        # Types + svelte-check + lint + circular deps
pnpm test         # Full e2e suite
pnpm dev:wrangler # Dev with Cloudflare D1 runtime
```

Root tests use Vitest + Playwright under `__tests__/e2e`. `repos/auth` also has Vitest.

## Architecture

SvelteKit 5 + Cloudflare Pages monorepo (pnpm workspaces).

**Internal packages:**
- `packages/calendar` (`@miko/calendar`) — Booking, D1 storage, Google Calendar, invites, admin auth
- `repos/auth` (`@goobits/auth`) — OAuth (Google/Apple), sessions, credentials, WebAuthn

**API bridge pattern:** SvelteKit routes (`src/routes/api/`) delegate to functions (`functions/api/`) via `buildEnv(platform)` in `_bridge.ts`. Dev uses local SQLite (`.dev/db.sqlite`, auto-migrates); production uses Cloudflare D1.

**Hooks** (`src/hooks.server.ts`): theme → redirects → admin auth → calendar auth → require user → security headers

**Database:** Migrations in `packages/calendar/migrations/`. Argon2/bcrypt stubbed for browser in `src/lib/stubs/`, aliased in `vite.config.js` and `wrangler.toml`.

## Path Aliases (svelte.config.js)

`@components`, `@lib`, `@src`, `@routes`, `@packages`, `@config`, `@media`, `@static` — all resolve to their obvious directories.

## Environment

Env files in `config/env/`, encrypted with dotenvx. See `.env.example` for all variables. Production secrets: `pnpm deploy:secrets`.

## CSS Conventions

- Prefer BEM-style class naming (`block__element--modifier`) for component and page styles.
- Prefer nested SCSS under a block root so selectors stay scoped and readable.
- Avoid introducing new legacy/flat selector patterns when adding or refactoring UI.

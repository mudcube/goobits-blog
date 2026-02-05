# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (port 3610)
pnpm stop         # Stop dev server
pnpm restart      # Restart dev server
pnpm build        # Production build (auto version bump)
pnpm dev:wrangler # Dev with Cloudflare D1 runtime
```

No test runner at root. `repos/auth` has vitest.

## Architecture

SvelteKit 5 + Cloudflare Pages monorepo (pnpm workspaces).

**Internal packages:**
- `packages/calendar` (`@miko/calendar`) — Booking, D1 storage, Google Calendar, invites, admin auth
- `repos/auth` (`@goobits/auth`) — OAuth (Google/Apple), sessions, credentials, WebAuthn

**API bridge pattern:** SvelteKit routes (`src/routes/api/`) delegate to functions (`functions/api/`) via `buildEnv(platform)` in `_bridge.ts`. Dev uses local SQLite (`.dev/db.sqlite`, auto-migrates); production uses Cloudflare D1.

**Hooks** (`src/hooks.server.ts`): theme → redirects → calendar auth → require user → security headers

**Database:** Migrations in `packages/calendar/migrations/`. Argon2/bcrypt stubbed for browser in `src/lib/stubs/`, aliased in `vite.config.js` and `wrangler.toml`.

## Path Aliases (svelte.config.js)

`@components`, `@lib`, `@src`, `@routes`, `@packages`, `@config`, `@media`, `@static` — all resolve to their obvious directories.

## Environment

Local dev config: `config/env/.env`. Production: Cloudflare secrets via `wrangler secret put`.

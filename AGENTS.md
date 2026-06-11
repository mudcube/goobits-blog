# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication

- Be brief in all responses. Lead with the answer, then only the essential details.

## Commands

```bash
pnpm dev          # Start dev server (port 3610)
pnpm dev:stop     # Stop dev server
pnpm dev:restart  # Restart dev server
pnpm build        # Production build
pnpm release:patch:build  # Patch bump + build
pnpm check        # Types + svelte-check + lint + circular deps
pnpm test         # Checks + full e2e suite
pnpm test:e2e     # Direct full e2e suite
pnpm dev:wrangler # Dev with Cloudflare D1 runtime
```

Root tests use Vitest + Playwright under `__tests__/e2e`. `packages/auth` also has Vitest.

## Architecture

SvelteKit 5 + Cloudflare Pages monorepo (pnpm workspaces).

**Internal packages:**
- `packages/calendar/core` (`@calendar/core`) — Booking, D1 storage, Google Calendar, invites, admin auth
- `packages/auth` (`@goobits/auth`) — OAuth (Google/Apple), sessions, credentials, WebAuthn

**API env bridge:** API route handlers (`src/routes/api/**/+server.ts`) call `buildEnv(platform)` in `packages/calendar/kit/src/runtime/build-env.ts` to access D1 in production and a local SQLite-backed D1 wrapper in dev (`.dev/db.sqlite`, auto-migrates).

**Hooks** (`src/hooks.server.ts`): theme → redirects → admin auth → calendar auth → require user → security headers

**Database:** Migrations in `packages/calendar/migrations/sql/`. Argon2/bcrypt stubbed for browser in `src/lib/stubs/`, aliased in `vite.config.js` and `wrangler.toml`.

## Path Aliases (svelte.config.js)

`@components`, `@lib`, `@src`, `@routes`, `@packages`, `@config`, `@media`, `@static` — all resolve to their obvious directories.

## Environment

Env files in `config/env/`, encrypted with dotenvx. Root miko.art uses `config/env/.env` with template `config/env/.env.example`; calendar-site uses `config/env/.env.calendar` with template `config/env/.env.calendar.example`. Production secrets: root `pnpm deploy:secrets`, calendar `pnpm --dir apps/calendar-site deploy:secrets`.

## CSS Conventions

- Prefer BEM-style class naming (`block__element--modifier`) for component and page styles.
- Prefer nested SCSS under a block root so selectors stay scoped and readable.
- Avoid introducing new legacy/flat selector patterns when adding or refactoring UI.
- Breakpoints: prefer `em` units (honors user font scaling). Tier convention documented at the top of `src/lib/app/theme/layout.css`: `30em` xs / `40em` sm / `48em` md / `64em` lg. Custom values are allowed when a component genuinely needs them — colocate with a one-line comment explaining why.

## Shared-Folder Git

- Shared macOS/Linux checkouts should use `core.filemode=false`; chmod-only changes will not be noticed reliably.
- When a script must be executable, run `git update-index --chmod=+x path/to/script.sh` and include that in the commit.

# Project Policy

Repo-specific facts for this checkout. Keep reusable agent behavior in
`.agents/`; keep local project facts here.

## Project Summary

- Name: miko-art
- Purpose: SvelteKit 5 + Cloudflare Pages site with auth, blog, contact, portfolio, and ops tooling.
- Primary language/framework: TypeScript, SvelteKit 5, SCSS, Cloudflare Pages/D1.
- Package manager: pnpm 10.
- Workspace/build system: pnpm workspaces under `packages/*`.

## Repository Layout

- `src/routes/`: SvelteKit app routes and API endpoints.
- `src/lib/`: app-level runtime, theme, release, and blog helpers.
- `packages/auth/`: `@goobits/auth` submodule.
- `packages/security/`, `packages/sitemap/`, `packages/nano-banana/`: submodules or package-local tooling.
- `config/env/`: dotenvx-managed env files.
- `scripts/`: audit, dev-server, e2e, seed, and image scripts.
- `ops/`: deploy, cron, and runbook tooling.
- `infra/aw/`: Agent Workspace submodule.

## Commands

```bash
pnpm dev          # start dev server on port 3610
pnpm dev:stop     # stop dev server
pnpm dev:restart  # restart dev server
pnpm build        # production build
pnpm check        # types, svelte-check, lint, package checks, boundaries, circular deps
pnpm test         # checks, unit/package tests, full e2e
pnpm test:e2e     # direct full e2e suite
pnpm dev:wrangler # Cloudflare runtime dev
pnpm run aw -- main # open default aw workspace
```

## Git And Package Workflow

- Git command policy: do not revert unrelated user changes; shared checkouts should use `core.filemode=false`.
- Commit command: use normal git commits unless asked otherwise.
- Package-manager mutation command: use `pnpm`; keep lockfile changes intentional.
- Submodule/worktree notes: existing submodules include `packages/auth`, `packages/nano-banana`, `packages/security`, `packages/sitemap`, and `infra/aw`.
- Commands that require explicit approval: destructive git operations such as reset/checkout of user changes.

## Testing

- Test framework: Vitest and Playwright under `__tests__/e2e`; `packages/auth` also has Vitest.
- Browser/rendering test command: use targeted e2e scripts where available.
- Full regression command: `pnpm test`.
- Targeted test guidance: prefer the smallest relevant `pnpm run e2e:*`, `pnpm run test:unit`, or package-local test.
- Known report viewers: Playwright/Vitest CLI output.

## Dev Server

- Start: `pnpm dev`.
- Stop: `pnpm dev:stop`.
- Logs: dev-server script output.
- Local URL: usually `http://localhost:3610`.
- Ports: app dev server uses `3610`.

## Documentation

- Human-facing proposals: keep in existing docs or ask before adding new long-form docs.
- LLM-facing docs: `AGENTS.md`, `.agents.local/project.md`, and package READMEs.
- Scratch/debug artifacts: avoid committing temporary output.
- Changelog: package-specific if present; otherwise follow user request.
- Index files to update: update route/package indexes when adding public surfaces.

## Code Standards Overrides

- Import rules: prefer existing aliases from `svelte.config.js`.
- File naming: follow local SvelteKit and package conventions.
- Type/JSDoc expectations: use TypeScript types; add comments only for non-obvious logic.
- UI/framework conventions: BEM-style classes, nested SCSS, `em` breakpoints.
- Security/privacy notes: keep auth/session and env handling isolated; do not expose secrets.

## Local Cautions

- Active generated folders: `.svelte-kit`, `build`, `dist`, package-local `target`, and nested `node_modules`.
- Slow/expensive commands: full `pnpm test` and full e2e suite.
- Shared resources: Cloudflare bindings, OAuth providers, payment providers, dotenvx secrets.
- Deployment or credential constraints: production secrets use `pnpm deploy:secrets`; do not edit encrypted envs casually.

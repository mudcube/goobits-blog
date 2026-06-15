# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each release groups changes by audience:
- **User-facing** — changes someone using the site would notice.
- **Internal** — refactors, package boundaries, tooling, build/CI, dev plumbing.
- **Security** — hardening that warrants its own callout.

## [Unreleased]

### User-facing
- Improved journal and SEO behavior: Worker-served journal routes, restored journal flourish components, richer titles/JSON-LD/Open Graph metadata, ISO dates, and Core Web Vitals polish.
- Apps/showcase grids now flow continuously across viewport sizes.
- Legal pages no longer duplicate "Last updated" copy and better match the site hero gutter on mobile.
- `ConfirmModal` accepts configurable horizontal alignment (viewport vs content).
- Wired discard-changes prompt; blog: sanitized markdown rendering, hardened anchors, fixed RSS escaping and slug collisions.

### Internal
- Converted `@goobits/auth`, `@goobits/sitemap`, and the nano-banana image-generation utility from in-tree copies to package submodules.
- Migrated blog, blog theme, contact, and sitemap packages toward `src/` package layouts with tighter export maps, package metadata, READMEs, and package-level `tsconfig.json` files.
- Extracted release-target gating into `@goobits/visibility-mode` with tests and removed dead visibility/weather shims.
- Updated dependencies, including `@lucide/svelte` and `@google/genai` v2; stabilized the full test suite and dev/e2e scripts.

### Security
- Hardened contact and journal flows with stricter request metadata handling, anti-abuse coverage, safe journal import checks, and route visibility hardening.
- Hardened Apple SSRF surface and added magic-byte validation for image uploads.
- Sanitized blog markdown to close XSS vectors.

## [1.3.1] - 2026-05-05

### User-facing
- Standalone `@goobits/blog` package with Miko theme, journal RSS at `/journal/rss.xml`, sitemap pills, labeled section dividers.
- AI/GEO support: `/llms.txt`, `/llms-full.txt`, journal markdown mirrors, AI-crawler allowlist in `robots.txt`.
- Standardized journal cover images across all 49 posts; restored higher-resolution variants; letterboxed small heroes instead of upscaling.
- Mobile responsiveness across admin pages and footer (44px touch targets, 12px minimum text); Lighthouse 100/100/100/100 across all categories.
- Fixed auth callback routing and magic-link redirects; admin mock redirects.

### Internal
- Promoted `formatLabel` to the `@goobits/blog` engine; humanized journal tag/category labels.
- Fixed prerender recursion for WebP image paths and generated image errors; stabilized blog/journal rendering after package extraction.

### Security
- Migrated to nonce-based CSP for scripts; allowed Google avatar URLs through CSP.
- Sitemap and anti-abuse flow hardening.

## [1.3.0-rc.1] - 2026-04-08

### User-facing
- Hardened public contact and registration flows with anti-abuse controls, verification support, and Cloudflare Turnstile launch configuration.
- Live/preview release gating for app navigation and route visibility.
- Standardized user-facing form controls across public, admin, and auth surfaces.

### Internal
- Reduced `src/lib` catchall ownership by moving app concerns into `src/lib/app/*` and content/page-specific logic into explicit domains.
- Restored green typecheck/test coverage after the path and ownership refactors.

## [1.2.0] - 2026-02-17

### User-facing
- Reworked admin information architecture to URL-backed sections (overview, availability, events, programs, members, integrations) with persistent deep links.
- Corrected admin login submit behavior and session stickiness issues in local dev.
- Fixed sitemap route clickability and multiple dead image/dead link regressions across journal and related pages.

### Internal
- Consolidated ops tooling under `ops/` and aligned cron/deploy workflows with forward-only structure.

### Security
- Enforced strict OAuth callback state validation and removed legacy auth/signin callback compatibility paths.
- Tightened API response validation/logging paths and eliminated unsafe compatibility casts in sync/auth flow.

## [1.1.0] - 2026-02-04

### User-facing
- Theme system with dark mode support.
- Sitemap page with automatic route discovery.
- Improved Rainbow layout with auth redirect and navigation structure; restyled with dark sleek design; enhanced admin dashboard with colors and icons.

### Internal
- Cloudflare Workers support with crypto module stubs for argon2/bcrypt; `dev:wrangler` script for local Workers development.
- Migrated from Yarn to pnpm; migrated to Cloudflare Pages deployment.
- TypeScript configuration and full codebase migration to TypeScript.
- Playwright for end-to-end testing.
- D1 database integration for Cloudflare Pages.
- Fixed logout page prerender issue, Cloudflare Pages `_routes.json` deployment error, and admin session TTL configuration parsing.

### Security
- Rewrote email handler with security hardening.

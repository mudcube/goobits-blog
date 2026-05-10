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
- Live shift drag reorder for programs, with shared `Tooltip` primitive and tooltip suppression during drag and pointerdown.
- Unified schedule visual language across booking and admin surfaces; refined editor chrome (URL pill fixed/editable zones, Pause/Play/Trash icons, dashed preview border, themed emoji picker).
- Redesigned profile page with topbar width parity; admin avatar and Calendar link in profile menu.
- `ConfirmModal` accepts configurable horizontal alignment (viewport vs content).
- Star icon marks today in calendar grids.
- Standardized border-radius across editor controls; humanized admin breadcrumbs; surfaced `joinedAt` in admin dashboard.
- Fixed `--bg`/`--text` color cycle in editor; quieted URL pill border; relocated New event affordance.
- Fixed URL pill alignment and width in settings strip; fixed vertical alignment of inputs inside inspector controls.
- Wired discard-changes prompt; blog: sanitized markdown rendering, hardened anchors, fixed RSS escaping and slug collisions.

### Internal
- Program editor inspector playground (`/playground/program-editor-inspector`) with extracted inspector primitives.
- Split `AdminProgramEditor` into cohesive modules; shared modal and credentials primitives.
- Consolidated program settings into the editor and retired `ProgramSettingsDrawer`; retired migration playground.
- Tokenized colors and simplified controller API; dropped dead booking code paths.
- Added unit tests for editor controllers and included `@calendar/ui` in vitest.

### Security
- Hardened Apple SSRF surface and added magic-byte validation for image uploads.
- Sanitized blog markdown to close XSS vectors.

## [1.3.1] - 2026-05-05

### User-facing
- Production booking flow at `/schedule/book` with crew cards, weather data, real APIs (join/leave/cancel), and Add-to-Calendar dropdown for Google/Apple/Outlook.
- Friendly invite codes (`word-word-number`), short invite URLs (`/invite/[code]`), and admin Invites page with bulk delete and confirm dialogs.
- Admin event-detail editing: inline title/date/time/capacity/description edits, hero image uploads, persistent week-start preference.
- Admin payment, calendar sync, and program settings sections with grouped cards, inline handle validation, and a floating "All saved" timestamp.
- Standalone `@goobits/blog` package with Miko theme, journal RSS at `/journal/rss.xml`, sitemap pills, labeled section dividers.
- AI/GEO support: `/llms.txt`, `/llms-full.txt`, journal markdown mirrors, AI-crawler allowlist in `robots.txt`.
- Open Graph meta tags for invite link previews; structured SEO metadata.
- Reorganized admin information architecture: unified topbar profile menu across admin/member, sticky full-height sidebar, fixed-height topbar (3rem), consistent row heights (4rem).
- Standardized journal cover images across all 49 posts; restored higher-resolution variants; letterboxed small heroes instead of upscaling.
- Bootstrapped admin data on the server so pages appear ready (eliminated empty-state flashes).
- Mobile responsiveness across admin pages and footer (44px touch targets, 12px minimum text); Lighthouse 100/100/100/100 across all categories.
- Fixed UTC day grouping in `/schedule/book`, program editor drawer overlap, layout shifts on initial booking and journal heroes, party emoji vertical alignment.
- Fixed invite delete failing for legacy non-numeric IDs (legacy invite codes purged via migration).
- Fixed auth callback routing and magic-link redirects; admin mock redirects.

### Internal
- Promoted booking design (v6) to `BookedStep` and retired prototype iterations v1–v5; renamed `dev/*` routes to `playground/*`.
- Programs reorder endpoint with atomic `moveProgram`.
- Shared admin primitives extracted: `AdminInlineConfirm`, `AdminToast`, `AdminMetaCard`, `AdminGroupedCard`, `EditableField`, `SyncCard`, `PaymentMethodRow`, `CalendarGrid`, `UrlPill`, `DayDialog`.
- Consolidated weather system; moved mock data into `@calendar/ui`; removed site-specific data from the calendar package.
- Promoted `formatLabel` to the `@goobits/blog` engine; humanized journal tag/category labels.
- Fixed prerender recursion for WebP image paths and generated image errors; stabilized blog/journal rendering after package extraction.

### Security
- Hardened auth and calendar production security; CSRF on join/leave and profile POST; availability program-access check.
- Migrated to nonce-based CSP for scripts; allowed Google avatar URLs through CSP.
- Closed booking-audit findings (data leak, entropy, N+1, consistency).
- Sitemap and anti-abuse flow hardening; calendar auth session and invite-claim rollback hardening.

## [1.3.0-rc.1] - 2026-04-08

### User-facing
- Hardened public contact and registration flows with anti-abuse controls, verification support, and Cloudflare Turnstile launch configuration.
- Live/preview release gating for app navigation and route visibility.
- Standardized user-facing form controls across public, admin, calendar, and auth surfaces.

### Internal
- Reorganized calendar UI into explicit `admin/` and `member/` domains, extracting reusable editor surfaces out of route files.
- Reduced `src/lib` catchall ownership by moving app concerns into `src/lib/app/*` and content/page-specific logic into explicit domains.
- Restored green typecheck/test coverage after the path and ownership refactors.

## [1.2.0] - 2026-02-17

### User-facing
- Social-first calendar experience with event feed actions (`Join`, `Join +1`, `Waitlist`, `Leave`), facepile participants, and memory recap support.
- Dynamic, database-backed calendar programs with admin CRUD and slug-driven member routes.
- Reworked admin information architecture to URL-backed sections (overview, availability, events, programs, members, integrations) with persistent deep links.
- Corrected admin login submit behavior and session stickiness issues in local dev.
- Fixed sitemap route clickability and multiple dead image/dead link regressions across journal and related pages.
- Fixed calendar button state styling regressions where enabled actions could appear visually disabled.

### Internal
- Async Google Calendar sync queue with admin queue health, retries, dead-letter handling, and recovery actions.
- Expanded E2E coverage for calendar/admin/auth/sitemap flows, including contention, dead links/images, and sync queue smoke checks.
- Refactored calendar/admin UI into shared shell/page components and centralized transport parsing to reduce duplication.
- Moved calendar domain logic into package-owned services and slimmed route handlers into a thin application layer.
- Consolidated ops tooling under `ops/` and aligned cron/deploy workflows with forward-only structure.

### Security
- Enforced strict OAuth callback state validation and removed legacy auth/signin callback compatibility paths.
- Tightened API response validation/logging paths and eliminated unsafe compatibility casts in sync/auth flow.

## [1.1.0] - 2026-02-04

### User-facing
- Rainbow Gym booking calendar with cancel functionality.
- Admin dashboard with booking management.
- OAuth authentication (Google, Apple) for Rainbow invite-only access.
- Theme system with dark mode support.
- Sitemap page with automatic route discovery.
- Improved Rainbow layout with auth redirect and navigation structure; restyled with dark sleek design; enhanced admin dashboard with colors and icons.
- Cancel modal accessibility (proper ARIA roles, Escape key handling); resolved Svelte a11y warnings.

### Internal
- Cloudflare Workers support with crypto module stubs for argon2/bcrypt; `dev:wrangler` script for local Workers development.
- Migrated from Yarn to pnpm; migrated to Cloudflare Pages deployment.
- Migrated calendar auth to `@goobits/auth` package.
- TypeScript configuration and full codebase migration to TypeScript.
- Playwright for end-to-end testing.
- `BookingCalendar` shared component with reusable styles.
- Session-based admin authentication; cancel booking service with secure cancel tokens.
- D1 database integration for Cloudflare Pages.
- Fixed logout page prerender issue, Cloudflare Pages `_routes.json` deployment error, and admin session TTL configuration parsing.

### Security
- Hardened admin and calendar API error handling and input validation.
- Rewrote email handler with security hardening.
- Added redirect validation for calendar auth.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Program editor inspector playground (`/playground/program-editor-inspector`) with extracted inspector primitives.
- Live shift drag reorder for programs, with shared `Tooltip` primitive and tooltip suppression during drag.
- `joinedAt` column in admin dashboard and humanized admin breadcrumbs.

### Changed
- Unified schedule visual language across booking and admin surfaces; refined editor chrome (URL pill fixed/editable zones, Pause/Play/Trash icons, dashed preview border, themed emoji picker).
- Split `AdminProgramEditor` into cohesive modules and shared modal/credentials primitives; consolidated program settings into the editor and retired `ProgramSettingsDrawer`.
- Standardized border-radius across editor controls; tokenized colors and simplified controller API.
- Redesigned profile page with topbar width parity; surfaced admin avatar and Calendar link in profile menu.
- `ConfirmModal` accepts configurable horizontal alignment (viewport vs content).
- Mark today with a star icon in calendar grids.

### Fixed
- `--bg`/`--text` color cycle in the editor; quieted URL pill border; relocated New event affordance.
- URL pill alignment and width inside settings strip; vertical alignment of inputs inside inspector controls.
- Wired discard-changes prompt; retired migration playground.
- Blog: sanitized markdown, hardened anchors, fixed RSS escaping and slug collisions.

### Security
- Hardened Apple SSRF surface and added magic-byte validation for image uploads; dropped dead booking code paths.

## [1.3.1] - 2026-05-05

### Added
- Production booking flow at `/schedule/book` with crew cards, weather data, real APIs (join/leave/cancel), and Add-to-Calendar dropdown for Google/Apple/Outlook.
- Friendly invite codes (`word-word-number`), short invite URLs (`/invite/[code]`), and admin Invites page with bulk delete and confirm dialogs.
- Admin event-detail editing: inline title/date/time/capacity/description edits, hero image uploads, and persistent week-start preference.
- Admin payment, calendar sync, and program settings sections with grouped cards, inline handle validation, and a floating "All saved" timestamp.
- Standalone `@goobits/blog` package with Miko theme, journal RSS at `/journal/rss.xml`, sitemap pills, and section dividers.
- AI/GEO support: `/llms.txt`, `/llms-full.txt`, journal markdown mirrors, and AI-crawler allowlist in `robots.txt`.
- Open Graph meta tags for invite link previews; structured SEO metadata.
- Programs reorder endpoint with atomic `moveProgram`.
- Shared admin primitives: `AdminInlineConfirm`, `AdminToast`, `AdminMetaCard`, `AdminGroupedCard`, `EditableField`, `SyncCard`, `PaymentMethodRow`, `CalendarGrid`, `UrlPill`, `DayDialog`.

### Changed
- Reorganized admin information architecture: unified topbar profile menu across admin/member, sticky full-height sidebar, fixed-height topbar (3rem), and consistent row heights (4rem).
- Promoted booking design (v6) to `BookedStep`; retired prototype iterations v1–v5; renamed `dev` routes to `playground`.
- Standardized journal cover images across all 49 posts; restored higher-resolution variants; letterboxed small heroes instead of upscaling.
- Bootstrapped admin data on the server so pages appear ready (no empty-state flashes).
- Consolidated weather system; moved mock data into `@calendar/ui`; removed site-specific data from the calendar package.
- Migrated to nonce-based CSP for scripts; allowed Google avatar URLs through CSP.
- Promoted `formatLabel` to the `@goobits/blog` engine; humanized journal tag/category labels.

### Fixed
- UTC day grouping in `/schedule/book`; program editor drawer overlap.
- Mobile responsiveness across admin pages and footer (44px touch targets, 12px minimum text).
- Lighthouse 100/100/100/100 across all categories.
- Invite delete failing for legacy non-numeric IDs; legacy invite codes purged via migration.
- Layout shift on initial booking load and journal hero images; party emoji vertical alignment.
- Prerender recursion for WebP image paths and generated image errors.
- Auth callback routing and magic-link redirects; admin mock redirects.
- Numerous blog/journal warnings, build issues, and rendering stability after package extraction.

### Security
- Hardened auth and calendar production security; CSRF on join/leave and profile POST; availability program-access check.
- Closed data-leak, entropy, and N+1 findings from booking audit.
- Sitemap and anti-abuse flow hardening; calendar auth session and invite-claim rollback hardening.

## [1.3.0-rc.1] - 2026-04-08

### Added
- Hardened public contact and registration flows with anti-abuse controls, verification support, and Cloudflare Turnstile launch configuration.
- Added live/preview release gating for app navigation and route visibility.

### Changed
- Standardized user-facing form controls across public, admin, calendar, and auth surfaces.
- Reorganized calendar UI into explicit `admin/` and `member/` domains, extracting reusable editor surfaces out of route files.
- Reduced `src/lib` catchall ownership by moving app concerns into `src/lib/app/*` and content/page-specific logic into explicit domains.

### Fixed
- Restored green typecheck/test coverage after the path and ownership refactors.

## [1.2.0] - 2026-02-17

### Added
- Social-first calendar experience with event feed actions (`Join`, `Join +1`, `Waitlist`, `Leave`), facepile participants, and memory recap support.
- Dynamic, database-backed calendar programs with admin CRUD and slug-driven member routes.
- Async Google Calendar sync queue with admin queue health, retries, dead-letter handling, and recovery actions.
- Expanded E2E coverage for calendar/admin/auth/sitemap flows, including contention, dead links/images, and sync queue smoke checks.

### Changed
- Reworked admin information architecture to URL-backed sections (overview, availability, events, programs, members, integrations) with persistent deep links.
- Refactored calendar/admin UI into shared shell/page components and centralized transport parsing to reduce duplication.
- Moved calendar domain logic into package-owned services and slimmed route handlers into a thin application layer.
- Consolidated ops tooling under `ops/` and aligned cron/deploy workflows with forward-only structure.

### Fixed
- Corrected admin login submit behavior and session stickiness issues in local dev.
- Fixed sitemap route clickability and multiple dead image/dead link regressions across journal and related pages.
- Fixed calendar button state styling regressions where enabled actions could appear visually disabled.

### Security
- Enforced strict OAuth callback state validation and removed legacy auth/signin callback compatibility paths.
- Tightened API response validation/logging paths and eliminated unsafe compatibility casts in sync/auth flow.

## [1.1.0] - 2026-02-04

### Added
- Cloudflare Workers support with crypto module stubs for argon2/bcrypt
- `dev:wrangler` script for local Cloudflare Workers development
- Playwright for end-to-end testing
- TypeScript configuration and full codebase migration to TypeScript
- Rainbow Gym booking calendar with cancel functionality
- BookingCalendar shared component with reusable styles
- Admin dashboard with booking management
- Session-based admin authentication
- OAuth authentication (Google, Apple) for Rainbow invite-only access
- Cancel booking service with secure cancel tokens
- Theme system with dark mode support
- Sitemap page with automatic route discovery
- D1 database integration for Cloudflare Pages

### Changed
- Migrated from Yarn to pnpm
- Migrated to Cloudflare Pages deployment
- Migrated calendar auth to @goobits/auth package
- Improved Rainbow layout with auth redirect and navigation structure
- Restyled Rainbow pages with dark sleek design
- Enhanced admin dashboard with colors and icons

### Fixed
- Cancel modal accessibility (proper ARIA roles, Escape key handling)
- Logout page prerender issue
- Cloudflare Pages _routes.json deployment error
- Admin session TTL configuration parsing
- Svelte a11y warnings

### Security
- Hardened admin API error handling and input validation
- Hardened calendar API input validation and error handling
- Rewrote email handler with security hardening
- Added redirect validation for calendar auth

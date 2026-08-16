# Changelog

All notable changes to the `@goobits/blog` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-08-16

### Added

- Backward-compatible `createMarkdownBlog` SvelteKit setup facade.
- Generic authorization contexts across engines, sources, routes, and RSS.
- Optional optimized taxonomy and related-post source capabilities.
- `createBlogPost` normalization for database and API adapters.
- Injectable URL resolution, complete UI messages, linked author presentation,
  and app-owned post extension snippets.
- Typechecked Markdown, database, and multi-user examples.

### Changed

- Markdown post creation now uses the same normalizer exposed to adapters.
- Goo and Forms remain required presentation peers.
- Taxonomy and related-post queries delegate to source capabilities when
  available and retain the existing in-memory fallback otherwise.

## [3.0.0] - 2026-08-13

### Added

- Instance-owned `createBlogEngine` API with injectable content sources.
- Normalized direct `BlogPost` model, queries, taxonomy, URLs, related-post
  scoring, and RSS modules.
- Markdown source supporting flat and nested paths, frontmatter aliases,
  localization, caching, explicit import-failure policies, image/link/excerpt
  derivation, and an injected raw-content reader.
- SvelteKit route, entry, RSS, and client content-loading adapters.
- Explicit draft read context required in addition to an all-post query.
- Safe external-link rehype transform and stable Markdown plugin exports.
- Direct-model `BlogIndex`, `BlogCard`, `BlogPost`, newsletter, share,
  taxonomy, gallery, lightbox, and prose components.
- Goo controls and focused Forms submission/error/status integration.
- GET-based search, sort, page, load-more, and accessible infinite pagination.
- Responsive WebP source sets for generated Markdown image variants.

### Changed

- Package version advanced to 3.0.0.
- `@goobits/blog/core` now exposes the instance-based domain API.
- The richer Miko v2 UI and Markdown behavior is the v3 compatibility floor.
- Related-post text relevance now uses MiniSearch and category-aware diversity.
- Final SEO markup and newsletter delivery remain consumer-owned.
- Markdown image dimensions now use `image-size`, including direct WebP files.

### Removed

- Mutable `initBlogConfig` global configuration and legacy handlers/utilities.
- The nested `metadata.fm` post shape and its consumer adapters.
- Duplicate Blog controls, layout/router/SEO wrappers, and nonfunctional UI
  options. Goo, Forms, and the host app now own those concerns.

### Fixed

- Markdown images are no longer misclassified as internal content links.
- Logger methods retain their console receiver under strict linting.
- Markdown image fallbacks retain their original URL while receiving intrinsic
  dimensions and lazy/async loading defaults.

## [2.0.0] - 2026-05-09

### Breaking changes

The package now ships from a `src/` subdirectory and the public surface
has been narrowed. Most consumers won't need code changes — the named
entries (`@goobits/blog`, `/core`, `/ui`, `/utils`, `/config`,
`/handlers`, `/i18n`, `/config/defaults`) all still resolve to the same
exports as 1.x. The breaking changes affect consumers using deep-path
wildcard imports.

#### Layout

- All source moved under `src/`. The published tarball is now
  `src/`-only — no top-level `index.ts` / `core.ts` / `config.ts` /
  `ui/` / `utils/` / `config/` / `handlers/` / `i18n/`.
- `package.json` `main`, `types`, `svelte`, `exports`, `files` all
  repointed at `./src/*`.

#### Dropped exports

The following sub-entries have been removed:

  - `./ui/*`        → use `./ui` (the curated barrel) for components
  - `./config/*`    → use `./config` (the index) for config exports
  - `./handlers/*`  → use `./handlers` (the index)
  - `./handlers`    → handler functions are also re-exported from `./core`,
                      which is the canonical entry. `./handlers` was a
                      redundant duplicate.

Two narrow explicit entries replace the previously implicit access via
`./utils/*` for the mdsvex plugins, which need stable module identity:

  - `./utils/remark-table-of-contents`
  - `./utils/rehype-webp-picture`

The `./utils` barrel itself is unchanged.

#### Migration

| 1.x import | 2.0 import |
| --- | --- |
| `@goobits/blog/ui/BlogCard.svelte` | `@goobits/blog/ui` (then named export) |
| `@goobits/blog/utils/blogUtils.js` | `@goobits/blog/utils` |
| `@goobits/blog/utils/remark-table-of-contents.js` | `@goobits/blog/utils/remark-table-of-contents` |
| `@goobits/blog/utils/rehype-webp-picture.js` | `@goobits/blog/utils/rehype-webp-picture` |
| `@goobits/blog/config/defaults` | unchanged |

If you genuinely need to import a single internal file by path, you
can still do so — the source is laid out the same way under `src/`,
but it's no longer part of the published `exports` surface.

### Added

- `DeepPartial<T>` type and a `DeepPartial<BlogConfig>` parameter type
  for `initBlogConfig`. Callers can now provide a deeply-nested
  override object (e.g. `{ posts: { contentBasePath: '...' } }`)
  without re-stating the full `PostsConfig` shape and without an
  `as unknown as Partial<BlogConfig>` cast.

### Changed

- Markdown post-processing: anchor `rel` now includes
  `noopener noreferrer` in addition to `nofollow`; `javascript:`,
  `data:`, `vbscript:`, `file:` link protocols are stripped.
- TOC heading-id deduplication (`-2`, `-3` suffixes) on duplicate
  heading text.
- RSS `<link>` and `<guid>` are XML-escaped (slug-derived URLs
  containing `&` previously produced invalid feeds).
- Slugify NFKD-folds diacritics and expands `&` → `and` (resolves
  `Q&A` vs `QA` collisions).
- `initBlogConfig` parameter type relaxed from `Partial<BlogConfig>`
  to `DeepPartial<BlogConfig>`. Existing callers passing top-level
  partials still type-check; deeply-nested partials no longer need
  a cast.

### Fixed

- `clientLoad.ts`: corrected indentation and locked the graceful
  null-fallback contract with a regression test.
- Sidebar: collapsed two near-identical render branches into a single
  section-descriptor + `#each` loop.

### Removed

- 64 lines of dead Tailwind-style utility classes (`.mb-*`, `.px-*`,
  `.flex`, `.text-*`, etc.) from `Blog.scss`. Zero consumers found
  in the repo or in journal content. If you relied on these in your
  markdown, declare them in your host stylesheet.
- `galleryLightbox` action and `GalleryItem` / `GalleryOpenDetail`
  types from the `@goobits/blog/ui` barrel — they're sibling-only
  internals. Reachable via the explicit
  `@goobits/blog/ui/actions/galleryLightbox` path if needed.

## [1.2.0] - 2026-02-05

### Added
- **Full TypeScript Conversion** - Complete migration to strict TypeScript
  - Enabled all strict type checking options (`strict`, `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, etc.)
  - Added explicit return types and parameter types throughout codebase
  - Proper type exports for all public interfaces
- **Comprehensive Test Suite** - 170 tests covering core functionality
  - Unit tests for `blogUtils`, `classUtils`, `readTimeUtils`, `secureDeepMerge`
  - Handler tests for route matching and error handling
  - RSS feed generation tests including XSS prevention
  - Edge case coverage for date parsing, slug generation, and filtering
- **Strict ESLint Configuration** - Enhanced code quality enforcement
  - `@typescript-eslint/strict-boolean-expressions` for safer conditionals
  - `@typescript-eslint/no-explicit-any` to prevent `any` usage
  - `@typescript-eslint/explicit-function-return-types` for better documentation

### Changed
- **Type System Cleanup** - Removed redundant type definitions
  - Eliminated local `BlogConfigType` interfaces that duplicated exported types
  - Replaced `as unknown as Type` double casts with direct property access
  - Simplified type imports using the canonical `BlogConfig` type
- **Code Quality Improvements** - Applied DRY principles
  - Consolidated duplicate code patterns
  - Improved documentation accuracy and consistency
  - Better error handling patterns

### Fixed
- **Test Type Errors** - Resolved strict TypeScript issues in tests
  - Fixed `exactOptionalPropertyTypes` violations in test helpers
  - Proper null checks for regex capture groups
  - Corrected async function signatures

## [1.1.3] - 2025-11-19

### Added
- **Wildcard Exports** - Enhanced module resolution for direct file imports
  - Added wildcard exports (`./ui/*`, `./utils/*`, `./config/*`, `./handlers/*`) for direct file imports
  - Improved flexibility in importing individual modules

## [1.1.2] - 2025-11-19

### Added
- **Svelte Export Conditions** - Enhanced SvelteKit compatibility
  - Added `svelte` condition to all export paths in package.json
  - Improved module resolution for Svelte components

## [1.1.0] - 2025-11-19

### Added
- **SvelteKit SSR Compatibility** - Enhanced server-side rendering support
  - Added `svelte` field to package.json for better SvelteKit integration
  - Improved SSR compatibility with Svelte 5

### Changed
- **Package Manager** - Standardized on pnpm
  - Added pnpm version requirement (>=9.0.0) in engines
  - Better dependency management

## [1.0.2] - 2025-11-16

### Added
- **Remote Image Support** - Enhanced image handling for external sources
  - Added `/products/` prefix to remote image detection
  - Added localhost domain to remote image prefixes
  - Added AWS S3 domains to remote image detection
  - Better support for CDN and external image sources

### Changed
- **Logging Migration** - Replaced `console.*` with structured `@goobits/logger`
  - Consistent logging throughout blog package
  - Better integration with monorepo logging standards
- **Styling Updates** - Improved blog visual design
  - Updated theme colors across blog components
  - Enhanced layout and component styling

### Fixed
- **Static Asset Handling** - Skip static asset requests in blog handler
  - Prevents unnecessary processing of static files
  - Improved performance for static resources
- **Route Normalization** - Improved blog route slug normalization
  - Better handling of trailing slashes
  - More reliable route matching

## [1.0.1] - 2024-12-15

### Added
- Initial published release of `@goobits/blog` package
- Core blog functionality:
  - Markdown blog post rendering
  - Blog post listing and pagination
  - Category and tag support
  - Internationalization (i18n) support
  - Responsive design
- Blog components:
  - BlogPost viewer
  - BlogList display
  - Category navigation
  - Tag filtering
- Utilities:
  - Markdown parsing and rendering
  - Slug generation
  - Date formatting
- Configuration system for blog customization

### Security
- No known security issues

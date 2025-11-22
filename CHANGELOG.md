# Changelog

All notable changes to the `@goobits/blog` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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


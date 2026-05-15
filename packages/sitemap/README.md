# @goobits/sitemap

Reusable sitemap core and XML helpers for SvelteKit sites.

## What this package owns

- Generic route entry types (`PageRouteEntry`, `ApiRouteEntry`, `RouteInventory`, `SitemapAudience`, `SitemapEntry`, `SitemapSort`, `SitemapRoute`)
- Filter/sort logic (`getFilteredSitemapGroups`, `getFilteredSitemapCount`, `getRouteTags`, `getSitemapAvailableTags`)
- Visibility mapping (`getSitemapAudiencesForVisibility`)
- XML and origin helpers exposed from `./server`

## What the host app owns

- Filesystem route scanning and SvelteKit-specific route discovery
- Category mapping (which paths belong to which group, e.g. "Journal Pages", "Scheduling")
- Sitemap audience matchers (which paths are `public`, `internal`, or `hidden`)
- `lastModified` source (git log, mtime, content store, etc.)
- Page UI, brand copy, and presentation

## Subpath exports

- `@goobits/sitemap` / `@goobits/sitemap/core` — types and pure functions; safe to import anywhere
- `@goobits/sitemap/server` — XML builders and origin helpers; server-only

## Usage

```ts
import {
  getSitemapAudiencesForVisibility,
  getFilteredSitemapGroups,
  type RouteInventory,
  type HumanSitemapVisibility
} from '@goobits/sitemap/core'
```

The host app builds a `RouteInventory` (using its own scanning/categorization rules) and hands it to the package's filter/sort/XML helpers.

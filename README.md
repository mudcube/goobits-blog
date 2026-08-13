# `@goobits/blog`

Instance-based Blog engine, Markdown source, SvelteKit adapters, and Svelte 5 presentation components.

## Features

- Direct, normalized `BlogPost` fields at every public boundary
- Flat and nested Markdown layouts
- Explicit draft preview authorization
- Search, sorting, pagination, categories, and tags
- Localized metadata and aliases
- Related-post scoring with explainable reasons
- RSS with canonical URLs and draft exclusion
- Injectable content sources for future database or API backends
- TOC, WebP picture, safe external-link, gallery, and prose helpers

## Setup

```ts
import { createBlogEngine } from '@goobits/blog/core'
import { createMarkdownContentSource } from '@goobits/blog/markdown'

const files = import.meta.glob('/src/content/journal/**/*.md')

export const blog = createBlogEngine({
	config: {
		name: 'Journal',
		description: 'Notes from the studio',
		basePath: '/journal',
		canonicalOrigin: 'https://example.com'
	},
	contentSource: createMarkdownContentSource({
		files,
		basePath: '/journal',
		readContent: loadRawMarkdown,
		resolveSourcePath: path => path.replace('/src/content/journal/', '@journal/')
	})
})
```

Configuration belongs to the returned engine. Creating one engine does not mutate another engine or any package-level singleton.

## SvelteKit

```ts
import { createBlogRouteHandlers } from '@goobits/blog/sveltekit'
import { blog } from '$lib/blog'

export const journalRoutes = createBlogRouteHandlers({
	engine: blog,
	getReadContext: event => ({
		allowDrafts: event.locals.releaseStage === 'preview'
	})
})
```

Draft access requires both `visibility: 'all'` and `{ allowDrafts: true }`. Public lists, prerender entries, related posts, and RSS default to published posts only.

## Imports

| Import | Owner |
|---|---|
| `@goobits/blog` | Direct post types and Blog UI |
| `@goobits/blog/core` | Engine, queries, taxonomy, URLs, related posts, RSS |
| `@goobits/blog/markdown` | Markdown content source |
| `@goobits/blog/sveltekit` | Route, page-load, entries, and RSS adapters |
| `@goobits/blog/ui` | Svelte presentation components and prose elements |
| `@goobits/blog/i18n` | Framework-neutral translation hooks |

The package returns normalized SEO data. The consuming app owns the final `<svelte:head>` composition, site identity, and release-stage policy.

## Markdown Plugins

```js
import { rehypeExternalLinks } from '@goobits/blog/markdown/rehype-external-links'
import { rehypeWebpPicture } from '@goobits/blog/markdown/rehype-webp-picture'
import { remarkTableOfContents } from '@goobits/blog/markdown/remark-table-of-contents'
```

Sanitize untrusted Markdown before rendering it. The external-link transform hardens links but is not a general HTML sanitizer.

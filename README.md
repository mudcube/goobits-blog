# `@goobits/blog`

Instance-based Blog engine, Markdown source, SvelteKit adapters, and Svelte 5 presentation components.

## Features

- Direct, normalized `BlogPost` fields at every public boundary
- Flat and nested Markdown layouts
- Explicit draft preview authorization
- Search, sorting, pagination, categories, and tags
- Localized metadata and aliases
- MiniSearch-backed related-post scoring with editorial, taxonomy, link,
  recency, and diversity signals
- RSS with canonical URLs and draft exclusion
- Injectable content sources for future database or API backends
- TOC, WebP picture, safe external-link, gallery, and prose helpers

## Setup

```ts
import { createMarkdownBlog } from '@goobits/blog/sveltekit'

const modules = import.meta.glob('/src/content/journal/**/index.md')
const rawContent = import.meta.glob<string>('/src/content/journal/**/index.md', {
	query: '?raw',
	import: 'default'
})

export const blog = createMarkdownBlog({
	config: {
		name: 'Journal',
		description: 'Notes from the studio',
		basePath: '/journal',
		canonicalOrigin: 'https://example.com'
	},
	modules,
	rawContent,
	getContext: (event) => ({
		allowDrafts: event.locals.preview === true
	})
})
```

Configuration belongs to the returned engine. Creating one engine does not mutate another engine or any package-level singleton.

## SvelteKit

```ts
import { blog } from '$lib/blog'

export const load = blog.routes.index
export const prerender = blog.prerender
```

The catch-all post route uses the same instance:

```ts
export const load = blog.routes.route
export const entries = blog.routes.entries
export const trailingSlash = blog.trailingSlash
```

Client content and RSS routes bind directly as well:

```ts
export const load = blog.routes.page
export const GET = blog.routes.rss
```

Draft access requires both `visibility: 'all'` and `{ allowDrafts: true }`. Public lists, prerender entries, related posts, and RSS default to published posts only.

The lower-level `createMarkdownContentSource`, `createBlogEngine`,
`createBlogRouteHandlers`, and `createBlogPageLoad` functions remain available
for custom pipelines. See the published `examples/` directory for Markdown,
database, and multi-user integrations.

## Database Sources

A database content source requires only `listPosts` and `getPost`. Make its
read context generic to carry tenant and viewer identity. Implement
`getCategories`, `getTags`, and `getRelatedPosts` when the backend can answer
those queries efficiently; the engine retains its in-memory fallback for
Markdown and small sources. Use `createBlogPost` to normalize database rows.

## Imports

| Import                              | Owner                                                  |
| ----------------------------------- | ------------------------------------------------------ |
| `@goobits/blog`                     | Direct post types and Blog UI                          |
| `@goobits/blog/core`                | Engine, queries, taxonomy, URLs, related posts, RSS    |
| `@goobits/blog/markdown`            | Markdown content source                                |
| `@goobits/blog/sveltekit`           | Route, page-load, entries, and RSS adapters            |
| `@goobits/blog/config`              | Engine and UI message configuration                    |
| `@goobits/blog/ui`                  | Svelte presentation components and prose elements      |
| `@goobits/blog/ui/gallery-lightbox` | Gallery action and event types for custom prose shells |
| `@goobits/blog/ui/blogTheme.css`    | Theme-variable-based editorial CSS                     |
| `@goobits/blog/i18n`                | Framework-neutral translation hooks                    |

The package returns normalized SEO data. The consuming app owns the final `<svelte:head>` composition, site identity, and release-stage policy.

## UI And Forms

`BlogIndex`, `BlogCard`, `BlogPost`, `BlogProse`, `BlogLightbox`, and the
prose elements consume direct `BlogPost` fields. The index exposes GET-based
search, sort, page navigation, load-more, and infinite modes. Infinite mode
retains a visible load-more control.

Newsletter delivery remains app-owned. The form uses Goo controls and Forms
submission state, and renders nothing until a working adapter is provided:

```svelte
<script>
	import { NewsletterForm } from '@goobits/blog/ui'

	const subscribe = async ({ email }) => await newsletterProvider.subscribe(email)
</script>

<NewsletterForm onSubscribe={subscribe} />
```

`BlogPost` renders Web Share and copy-link actions. Email, Facebook, and X
links appear only when explicitly included in `shareNetworks`.

Goo and Forms are required peers. Blog uses them as the single control and form
foundation rather than shipping alternate native controls.

Pass `urlResolver` to `BlogIndex` or `BlogPost` to override post, taxonomy,
feed, or author paths. The resolver flows to nested cards and taxonomy lists.
All visible and assistive UI text is configurable through `messages`.

`BlogPost` accepts `actions` and `afterContent` snippets for app-owned edit,
moderation, comment, or discussion UI. Blog does not implement those policies.

## Markdown Plugins

```js
import { rehypeExternalLinks } from '@goobits/blog/markdown/rehype-external-links'
import { rehypeWebpPicture } from '@goobits/blog/markdown/rehype-webp-picture'
import { remarkTableOfContents } from '@goobits/blog/markdown/remark-table-of-contents'
```

`rehypeWebpPicture` adds lazy/async loading to article images. When
`generated/<name>-<width>.webp` files exist beside a source image, it emits an
ordered responsive source set while preserving the original image as the
fallback. Configure the rendered width for each consumer:

```js
rehypeWebpPicture({ sizes: '(max-width: 48rem) 100vw, 48rem' })
```

The plugin does not parse image binaries. To add intrinsic dimensions, inject
the synchronous metadata lookup already owned by the host asset pipeline:

```js
rehypeWebpPicture({
	resolveImageDimensions: (filePath) => imageMetadata.get(filePath)
})
```

The resolver may return `{ width, height }`, `null`, or `undefined`.
Resolver errors and invalid dimensions fail soft without changing the image.
Explicit image dimensions always win.

Set `variantDirectory` only when generated files use a directory other than
`generated`. A same-name `.webp` sibling remains supported when no responsive
variants exist.

Sanitize untrusted Markdown before rendering it. The external-link transform hardens links but is not a general HTML sanitizer.

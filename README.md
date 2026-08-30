<h1 align="center">@goobits/blog</h1>

<p align="center"><strong>An instance-based blog engine for Markdown, custom content sources, SvelteKit, and Svelte 5.</strong></p>
<p align="center">Compose content queries and RSS through one engine, then add draft-aware SvelteKit routes and Svelte presentation explicitly.</p>

<p align="center">
  <a href="#why-blog">Why Blog</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#public-surface">Public surface</a> ·
  <a href="#ownership-and-safety">Boundaries</a>
</p>

---

## Why Blog

`@goobits/blog` normalizes content from flat or nested Markdown and injectable
database or API sources into one `BlogPost` shape. `createBlogEngine` owns one
configuration, content source, and the query, taxonomy, related-post, and RSS
operations built over it. `createMarkdownBlog` composes that engine with
Markdown loading, draft-aware SvelteKit handlers, and route bindings. UI
messages remain component inputs. Neither path mutates a package-level
singleton.

The package also provides Svelte 5 article and index components, prose elements,
gallery behavior, table-of-contents and image transforms, search, sorting,
pagination, categories, tags, localized metadata, and canonical URL helpers.

## Quick start

Use Node.js 22 for the maintained source graph. Blog's own manifest declares
Node.js 18 or newer, but its Forms peer depends on the source-only
`@goobits/logger` workspace package, whose runtime baseline is Node.js 22.

This revision is workspace-first, not a verified registry-only install. Check
out Blog, Forms, Goo, Logger, and Security in one pnpm workspace, then declare
Blog as a workspace dependency of the host application. The host also supplies
`@lucide/svelte`, SvelteKit 2, Svelte 5, and TypeScript 5 or 6. Forms currently
resolves Goo, Logger, and Security through `workspace:*`; Logger explicitly has
no npm-publish flow, so a standalone `pnpm add @goobits/blog` path is not
supported by the maintained source graph.

```ts
import { createMarkdownBlog } from '@goobits/blog/sveltekit'

const modules = import.meta.glob('/src/content/journal/**/index.md')
const rawContent = import.meta.glob<string>(
  '/src/content/journal/**/index.md',
  { query: '?raw', import: 'default' },
)

export const blog = createMarkdownBlog({
  modules,
  rawContent,
  config: {
    name: 'Journal',
    description: 'Notes from the studio',
    basePath: '/journal',
    canonicalOrigin: 'https://example.com',
  },
  getContext: (event) => ({ allowDrafts: event.locals['preview'] === true }),
})
```

Bind `blog.routes.index`, `blog.routes.route`, `blog.routes.page`, and
`blog.routes.rss` to the matching SvelteKit route files. The Markdown example is
a concrete package setup. The database and multi-user examples are typechecked
adapter sketches: the package does not ship their declared repository,
database, tenant lookup, or authentication.

## Public surface

| Import | Responsibility |
| --- | --- |
| `@goobits/blog` | Blog types and primary UI |
| `@goobits/blog/core` | Engine, queries, taxonomy, URLs, related posts, and RSS |
| `@goobits/blog/markdown` | Markdown source |
| `@goobits/blog/sveltekit` | Route, page-load, entries, and RSS adapters |
| `@goobits/blog/ui` | Svelte presentation and prose elements |
| `@goobits/blog/config` | Engine and message configuration |
| `@goobits/blog/i18n` | Framework-neutral translation hooks |
| `@goobits/blog/markdown/remark-table-of-contents`, `@goobits/blog/markdown/rehype-webp-picture`, `@goobits/blog/markdown/rehype-external-links` | Maintained Markdown transforms |
| `@goobits/blog/ui/elements`, `@goobits/blog/ui/gallery-lightbox`, `@goobits/blog/ui/blogTheme.css` | Prose elements, gallery action, and theme CSS |

Database sources need only `listPosts` and `getPost`. Optional taxonomy and
related-post methods let a backend answer those queries efficiently; otherwise,
the engine derives those results from `listPosts` in memory.

## Responsive images

Cover images may include AVIF and WebP source sets. Keep asset imports and
layout policy in the consuming app, then pass normalized responsive metadata
through `BlogImage`; Blog components honor the supplied `sizes` expression.

```ts
const image = {
  src: '/media/cover.jpg',
  alt: 'Editorial cover',
  width: 940,
  height: 529,
  sizes: '(max-width: 48rem) 100vw, 32rem',
  sources: {
    avif: '/media/cover-480.avif 480w, /media/cover-940.avif 940w',
    webp: '/media/cover-480.webp 480w, /media/cover-940.webp 940w',
  },
}
```

## Ownership and safety

Draft access requires both a visibility request and an authorized
`allowDrafts` context. Public lists, prerender entries, related posts, and RSS
exclude drafts by default.

The package returns normalized SEO data; the application owns final
`<svelte:head>` composition, site identity, and release policy. Newsletter
delivery, authentication, moderation, comments, and discussions are also
application-owned. Goo supplies controls and Forms supplies submission state.

Sanitize untrusted Markdown before rendering it. The external-link transform
hardens links but is not a general HTML sanitizer. Markdown import failures warn
and skip the affected post by default; use the source's `throw` failure mode when
a release must fail closed.

## Documentation

- [Upgrade guide](UPGRADE.md)
- [Changelog](CHANGELOG.md)

The 2.x and older changelog entries describe historical surfaces. The current
package exports and 3.x upgrade guidance define the maintained API.

## Development

After hydrating the complete source workspace and its peer packages, the Blog
repository exposes these verification gates:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm typecheck
```

## License

[MIT](LICENSE) © 2024 HoneyFarmer.com


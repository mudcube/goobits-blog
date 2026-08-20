# Upgrading `@goobits/blog`

## Upgrading From 3.0 To 3.1

Version 3.1 is backward-compatible. Existing engine, Markdown source, and route
factory integrations continue to work.

- New Markdown consumers can replace their manual composition with
  `createMarkdownBlog` from `@goobits/blog/sveltekit`.
- `BlogContentSource`, `BlogEngine`, and route handlers accept a typed read
  context for tenant and viewer authorization.
- Database sources can implement optimized taxonomy and related-post methods;
  existing sources retain the list-based fallback.
- Shared UI accepts one URL resolver and a complete message catalog.
- Goo and Forms remain required peers.

The facade is additive. Adopt it when convenient, then remove the superseded
consumer route adapters and content-loader wrappers.

## Upgrading From 2.x To 3.0

Version 3 replaces global configuration and nested processed-post objects with
an instance-owned engine and one direct `BlogPost` model.

### Required Changes

1. Replace `initBlogConfig` and `blogConfig` with `createBlogEngine` and a
   content source.
2. Replace `post.metadata.fm.title` and similar access with direct fields such
   as `post.title`, `post.categories`, and `post.tags`.
3. Replace `/utils`, `/handlers`, and `/config/defaults` imports with the
   focused `/core`, `/markdown`, `/sveltekit`, `/config`, and `/ui` entries.
4. Rename legacy page components to the v3 composition components:

| 2.x            | 3.0                                 |
| -------------- | ----------------------------------- |
| `BlogListPage` | `BlogIndex`                         |
| `BlogPostPage` | `BlogPost` from `@goobits/blog/ui`  |
| `Newsletter`   | `NewsletterForm` with `onSubscribe` |
| `BlogSEO`      | App-owned `<svelte:head>`           |
| `BlogRouter`   | `createBlogRouteHandlers`           |

The root package exports the `BlogPost` model type and aliases the component as
`BlogPostView`. The UI entry exports the component as `BlogPost`.

### Package Ownership

- Goo owns controls, loading, focus, dialogs, and keyboard behavior.
- Forms owns validation, submission state, errors, and announcements.
- Blog owns posts, discovery, routing, RSS, related posts, and editorial UI.
- The app owns authentication, CRUD, moderation, newsletter providers, final
  SEO markup, and preview authorization.

### Drafts

Draft access is default-deny. A caller must request `visibility: 'all'` and
provide `{ allowDrafts: true }`; setting either one alone does not expose a
draft. RSS and prerender entries always exclude drafts.

### Markdown Plugins

```diff
- @goobits/blog/utils/remark-table-of-contents
- @goobits/blog/utils/rehype-webp-picture
+ @goobits/blog/markdown/remark-table-of-contents
+ @goobits/blog/markdown/rehype-webp-picture
+ @goobits/blog/markdown/rehype-external-links
```

The link plugin hardens external anchors but is not an HTML sanitizer. Sanitize
untrusted content in the consuming app's Markdown pipeline.

# Upgrading `@goobits/blog`

Per-major upgrade notes. The full release history is in
[CHANGELOG.md](./CHANGELOG.md); this file is the migration guide for
existing consumers.

## Upgrading from 1.x to 2.0

`@goobits/blog@2.0` is a structural redesign of the published package.
**Most consumers won't need code changes** — the named entries you've
been importing (`@goobits/blog`, `/core`, `/ui`, `/utils`, `/config`,
`/handlers`, `/i18n`, `/config/defaults`) all still resolve to the
same exports.

The breaking changes only affect consumers using **wildcard
deep-path imports**.

### What changed

- The package now ships from a `src/` subdirectory. The published
  tarball no longer has top-level `index.ts` / `core.ts` /
  `config.ts` / `ui/` / `utils/` / `config/` / `handlers/` / `i18n/`.
  All source lives under `./src/*`. `package.json` `main`, `types`,
  `svelte`, `exports`, and `files` all repointed accordingly.
- The `exports` map dropped four wildcard sub-entries
  (`./ui/*`, `./config/*`, `./handlers/*`, and the bulk of `./utils/*`)
  plus the redundant `./handlers` named entry. Two narrow replacements
  added for the mdsvex plugins that need stable module identity
  (`./utils/remark-table-of-contents`, `./utils/rehype-webp-picture`).
  Handler functions are still available via `./core`.
- Anchor `rel` on rendered post HTML now includes `noopener noreferrer`
  in addition to `nofollow`. Dangerous link protocols (`javascript:`,
  `data:`, `vbscript:`, `file:`) are stripped.
- Slugify NFKD-folds diacritics and expands `&` → `and`.
- TOC heading IDs deduplicate when the same heading text appears
  multiple times (`-2`, `-3` suffixes).
- RSS `<link>` and `<guid>` are XML-escaped (slug-derived URLs
  containing `&` previously produced invalid feeds).
- 64 lines of unused Tailwind-style utility classes (`.mb-*`,
  `.px-*`, `.flex`, `.text-*`, etc.) removed from `Blog.scss`.
- `galleryLightbox` action and its types removed from the
  `@goobits/blog/ui` barrel; still reachable via the explicit
  `@goobits/blog/ui/actions/galleryLightbox` path.

### Migration

In almost every case, the `@goobits/blog/<entry>` imports you
already have keep working. Only deep-path wildcard imports need to
change.

| 1.x import | 2.0 import |
| --- | --- |
| `@goobits/blog/ui/BlogCard.svelte` | `@goobits/blog/ui` (then `import { BlogCard }`) |
| `@goobits/blog/utils/blogUtils.js` | `@goobits/blog/utils` |
| `@goobits/blog/utils/remark-table-of-contents.js` | `@goobits/blog/utils/remark-table-of-contents` |
| `@goobits/blog/utils/rehype-webp-picture.js` | `@goobits/blog/utils/rehype-webp-picture` |
| `@goobits/blog/config/index.js` | `@goobits/blog/config` |
| `@goobits/blog/config/defaults` | unchanged |
| `@goobits/blog/handlers` | `@goobits/blog/core` |
| `@goobits/blog/handlers/index.js` | `@goobits/blog/core` |

#### Walking through your codebase

```bash
# Find anything that might need updating
grep -r '@goobits/blog/ui/' src/
grep -r '@goobits/blog/utils/' src/
grep -r '@goobits/blog/config/' src/
grep -r '@goobits/blog/handlers/' src/
```

If a result imports a single named export, route it through the
matching curated barrel:

```diff
- import BlogCard from '@goobits/blog/ui/BlogCard.svelte'
+ import { BlogCard } from '@goobits/blog/ui'
```

If a result imports the rehype/remark mdsvex plugins, drop the `.js`
extension and use the new explicit entry:

```diff
- import { remarkTableOfContents } from '@goobits/blog/utils/remark-table-of-contents.js'
- import { rehypeWebpPicture } from '@goobits/blog/utils/rehype-webp-picture.js'
+ import { remarkTableOfContents } from '@goobits/blog/utils/remark-table-of-contents'
+ import { rehypeWebpPicture } from '@goobits/blog/utils/rehype-webp-picture'
```

#### Markdown post-processing

If you rendered untrusted markdown and were relying on the package
*not* sanitizing scripts or stripping `javascript:` links, you need
to revisit your security model — 2.0 sanitizes by default. There is
no opt-out at the API level; if you need raw HTML through, run your
own pipeline outside the package.

#### Removed Tailwind-style utility classes

If you used classes like `.mb-4`, `.px-2`, `.flex`, `.text-lg`,
`.bg-amber-500`, etc. in your markdown post bodies (these were
previously declared globally in `Blog.scss`), they no longer exist.
Either declare the classes you need in your host stylesheet, or
adopt Tailwind itself.

### What didn't change

- All public *named* exports keep the same names and signatures.
- The post-content HTML pipeline (mdsvex remark/rehype + sanitize +
  picture upgrade + dangerous-href neutralization) renders the same
  results unless you were depending on the specific bugs that 2.0
  fixes (raw `&` in slugs, duplicate heading IDs, etc.).
- The configuration shape (`BlogConfig`) and `initBlogConfig`
  semantics are unchanged.
- All 182 unit tests continue to pass after the migration.

If you hit a regression that isn't covered above, please open an
issue with the import path you were using and the error you got.

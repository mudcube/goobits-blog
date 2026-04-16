# `@goobits/blog-theme-miko`

Miko-specific presentation package for `@goobits/blog`.

This package is intentionally thin:

- `@goobits/blog` remains the content/runtime engine
- `@goobits/blog-theme-miko` owns archive/post composition and styling
- host apps still provide global site tokens, shell, and route config

Current entrypoint:

- `MikoBlogRouter`

Journal image pipeline:

- Journal hero source images should live at `static/journal/**/images/hero.(png|jpg|jpeg|webp)`.
- `pnpm build` runs `pnpm images:journal:generate` first.
- Responsive hero variants are emitted to sibling `images/generated/`.
- `packages/blog-theme-miko/utils/generated/journal-image-manifest.ts` is generated and should not be edited by hand.

Audit notes:

- `pnpm audit:images:oversized` is intended to flag production-facing static assets.
- Embedded archive source trees under `static/labs/*/source/` are intentionally ignored by that audit.

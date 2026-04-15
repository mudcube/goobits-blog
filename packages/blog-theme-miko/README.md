# `@goobits/blog-theme-miko`

Miko-specific presentation package for `@goobits/blog`.

This package is intentionally thin:

- `@goobits/blog` remains the content/runtime engine
- `@goobits/blog-theme-miko` owns archive/post composition and styling
- host apps still provide global site tokens, shell, and route config

Current entrypoint:

- `MikoBlogRouter`

# @calendar/app

SvelteKit route handlers for the calendar/scheduling system. This package
exposes `+page.server.ts`, `+server.ts`, and form actions under
`src/routes/api/`, `src/routes/admin/`, etc., and is mounted into the host
app's route tree.

## What's public

```
src/
├── routes/        ← API + admin + auth + calendar route handlers
├── server/        ← server-only helpers (admin-api-helpers, etc.)
└── ...
```

Consumers import route handlers and helpers from the relevant deep paths;
there is no top-level barrel because routes are filesystem-driven.

## Layering

`app` sits at the top of the calendar federation: it imports from `core`
(domain), `kit` (HTTP/auth/runtime), and `ui` (page components). Nothing
inside the calendar federation should import from `app`.

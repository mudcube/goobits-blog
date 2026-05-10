# @calendar/* (federation)

Calendar is a mini-monorepo of seven sub-packages that compose into the
booking/scheduling system. Each sub-package is a private workspace package
with one job; consumers import from the leaf packages, never from this
folder directly.

| Package | Role |
| --- | --- |
| [`core/`](./core) | Server domain — booking, D1 storage, Google Calendar, invites, admin auth |
| [`ui/`](./ui) | Svelte components for admin + member schedule UI |
| [`kit/`](./kit) | Runtime/build-env bridge, HTTP helpers, dev D1 shim |
| [`app/`](./app) | SvelteKit route handlers wiring core + ui together |
| [`migrations/`](./migrations) | SQL migrations + runner |
| [`theme/`](./theme) | SCSS-only theming layer (admin / member / shared partials) |
| [`presets/miko/`](./presets/miko) | Site-specific config preset, applied at boot |

## Layering

```
app  →  ui  →  kit  →  core
              ↘
            migrations
theme  →  consumed by app/ui at layout level
presets →  applied once at server startup (hooks.server.ts)
```

`core` is the lowest layer. `kit` should not import from `core` (a documented
inversion exists today and is on the cleanup list).

## Dev workflow

- Auto-migrations run via the dev D1 shim in `kit/src/dev/sqliteDb.ts`.
- Touch a `core/` file? Restart the dev server (`pnpm dev:restart`).
- Touch a `migrations/sql/*.sql` file? Delete `.dev/db.sqlite` to re-apply
  cleanly.

See each sub-package's README for its own conventions.

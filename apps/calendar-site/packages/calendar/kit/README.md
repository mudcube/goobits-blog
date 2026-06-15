# @calendar/kit

Cross-cutting infrastructure for the calendar federation: HTTP response
helpers, auth glue, dev runtime shims, and the production/dev D1 bridge.

## What's public

| Sub-entry | Purpose |
| --- | --- |
| `kit/auth/calendar` | Calendar-specific session + redirect helpers built on `@goobits/auth` |
| `kit/http/api` | API response helpers (`apiOk`, `apiError`, `apiValidationError`, `noStoreHeaders`) |
| `kit/runtime/build-env` | `buildEnv(platform)` — single source for D1 access in dev and prod |
| `kit/dev/sqliteDb` | Better-sqlite3-backed D1 shim for local dev with auto-migration |

The intent is "things every app/route handler needs but that don't belong in
the domain layer."

## Layering

`kit` depends only on `@goobits/*` packages, `@sveltejs/kit`, and
`@calendar/migrations` — **not** on `@calendar/core`. Calendar-specific
auth wiring (login context, invite-claim hook) used to live in
`kit/auth/calendar.ts` but inverted that rule by importing core domain
logic; it now lives in `@calendar/app/src/server/auth/calendar.ts` where
domain-aware setup belongs.

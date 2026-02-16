# Calendar Sync Runbook

## Purpose

Keep Google Calendar in sync with local booking changes without blocking joins/leaves.

## Normal Operation

1. Scheduler runs `pnpm calendar:sync` every 1 to 5 minutes.
2. Command calls `/api/internal/calendar/sync` with bearer auth.
3. Queue processor claims jobs, syncs to Google, retries failures with backoff.

## Required Environment

- `PUBLIC_BASE_URL`
- `CALENDAR_SYNC_CRON_SECRET` (recommended)
- `ADMIN_PASSCODE` (fallback if no cron secret configured)

## Failure Signals

- Admin "Needs attention" shows queue lag/failures.
- Cron command exits non-zero.
- API returns `ok: false`.

## Manual Recovery

1. Validate env values and secret.
2. Run `pnpm calendar:sync` manually.
3. Check admin dashboard queue health.
4. If repeated failures persist, inspect Google OAuth token/refresh validity.

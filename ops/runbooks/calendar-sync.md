# Calendar Sync Runbook

## Purpose

Keep Google Calendar in sync with local booking changes without blocking joins/leaves.

## Normal Operation

1. Scheduler runs `pnpm calendar:sync` every 1 to 5 minutes.
2. Command calls `/api/internal/calendar/sync` with bearer auth.
3. Queue processor claims jobs, syncs to Google, retries failures with backoff.

## Required Environment

- `PUBLIC_BASE_URL`
- `CALENDAR_SYNC_CRON_SECRET`

## Failure Signals

- Admin "Needs attention" shows queue lag/failures.
- Admin "Needs attention" shows dead-letter jobs (manual intervention required).
- Cron command exits non-zero.
- API returns `ok: false`.

## Manual Recovery

1. Validate env values and secret.
2. Run `pnpm calendar:sync` manually.
3. Check admin dashboard queue health.
4. If repeated failures persist, inspect Google OAuth token/refresh validity.
5. Requeue dead-letter jobs after fixing root cause:

```bash
curl -sS -X POST "$PUBLIC_BASE_URL/api/admin/sync-queue" \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=<session-cookie>" \
  --data '{"action":"retry_dead_letters","limit":25}'
```

6. Purge dead-letter jobs only when intentionally discarding them:

```bash
curl -sS -X POST "$PUBLIC_BASE_URL/api/admin/sync-queue" \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=<session-cookie>" \
  --data '{"action":"purge_dead_letters","limit":100}'
```

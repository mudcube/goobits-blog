# Ops

Operational assets only:

- `cron/` scheduled jobs and runners
- `deploy/` release/deployment scripts
- `runbooks/` production troubleshooting and operating procedures

Current cron jobs:

- `calendar-sync.mjs` processes pending Google Calendar sync jobs from the internal queue.

Current deploy scripts:

- `deploy/deploy-secrets.mjs`
- `deploy/deploy-prod.mjs`

Run manually:

```bash
pnpm calendar:sync
```

Required env:

- `PUBLIC_BASE_URL`
- `CALENDAR_SYNC_CRON_SECRET`

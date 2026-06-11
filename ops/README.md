# Ops

Operational assets only:

- `cron/` scheduled jobs and runners
- `deploy/` release/deployment scripts
- `runbooks/` production troubleshooting and operating procedures

Current cron jobs:

- None in the root `miko.art` app.

Current deploy scripts:

- `deploy/deploy-secrets.mjs`
- `deploy/deploy-prod.mjs`

Run manually:

```bash
pnpm deploy:prod
```

Required env:

- `PUBLIC_BASE_URL`

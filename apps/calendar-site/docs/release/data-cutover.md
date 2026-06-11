# Calendar Site Data Cutover

## Inputs To Fill Before Launch

- Calendar domain: `TODO`
- Cloudflare Pages project: `TODO`
- D1 database name/id: `TODO`
- R2 media bucket and public base URL: `TODO`
- OAuth callback origins: `TODO`
- Payment callback origins: `TODO`
- Session policy: existing sessions will not carry across domains unless a shared-cookie/domain strategy is chosen.

## Export From Current Production

1. Freeze calendar writes on `miko.art`.
2. Export the current calendar D1 database.
3. Record export timestamp, source database id, and command output.
4. Preserve a copy of the exported SQL/SQLite artifact outside the repo.

## Import To Calendar Site

1. Create the target D1 database named in `apps/calendar-site/wrangler.toml`.
2. Apply migrations from `packages/calendar/migrations/sql`.
3. Import the exported production data.
4. Bind the database to `apps/calendar-site` as `DB`.
5. Bind the media bucket as `MEDIA`.

## Validation

Run these after import:

```bash
pnpm --dir apps/calendar-site build
pnpm --dir apps/calendar-site calendar:sync
```

Manual smoke checks:

- `/` loads program list.
- `/login` starts OAuth.
- `/admin` requires login.
- `/api/calendar/ics` returns an ICS response.
- Admin can list programs, events, crew, payment settings, and sync queue.
- A test event can be created, joined, left, and synced.

## Rollback

1. Point old redirects back to `miko.art` or disable them.
2. Restore write access on the original D1 database.
3. Disable calendar-site cron until data divergence is reviewed.

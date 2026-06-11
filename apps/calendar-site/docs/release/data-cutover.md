# Calendar Site Data Cutover

## Inputs To Fill Before Launch

- Calendar domain: `pdx.fun`
- Cloudflare Pages project: `calendar-site`
- D1 database name/id: `calendar-site-db` / `TODO database_id from Cloudflare`
- R2 media bucket and public base URL: `calendar-site-media` / `https://media.pdx.fun`
- OAuth callback origins: `https://pdx.fun`
- Payment callback origins: `https://pdx.fun`
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
6. Replace placeholder `database_id` in `apps/calendar-site/wrangler.toml`.
7. Deploy production secrets with `pnpm --dir apps/calendar-site deploy:secrets`.

## Validation

Run these after import:

```bash
pnpm --dir apps/calendar-site build
pnpm --dir apps/calendar-site calendar:sync
```

Manual smoke checks:

- `/` loads the `pdx.fun` homepage.
- `/login` starts OAuth.
- `/register` creates an account and organizer tenant.
- `/events/new` creates a tenant-owned event for signed-in users.
- `/organizer` lists the signed-in creator tenant and events.
- `/organizer/settings` updates tenant name/slug and records collaborator invites.
- `/t/pdx-fun` loads the default public organizer page.
- `/t/<tenant>/events/<id>` loads a public event detail page and offers sign-in/join.
- `/admin` requires login.
- `/api/calendar/ics` returns an ICS response.
- Admin can list programs, events, crew, payment settings, and sync queue.
- A test event can be created, joined, left, and synced.

Evidence to capture:

- Build output from `pnpm --dir apps/calendar-site build`.
- D1 migration output showing latest applied migration `0031_calendar_tenant_invites.sql`.
- Cloudflare Pages production deployment URL and deployment id.
- Successful cron run timestamp and sync queue status.

## Rollback

1. Point old redirects back to `miko.art` or disable them.
2. Restore write access on the original D1 database.
3. Disable calendar-site cron until data divergence is reviewed.

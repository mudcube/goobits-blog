# Calendar Site Launch Checklist

## DNS And Hosting

- [ ] Create Cloudflare Pages project `calendar-site` for `apps/calendar-site`.
- [ ] Set production domain to `pdx.fun`.
- [ ] Set preview domain and keep it off public indexes.
- [ ] Confirm `PUBLIC_BASE_URL=https://pdx.fun` in Pages vars and `config/env/.env.calendar.production`.
- [ ] Confirm Pages builds with `pnpm --dir apps/calendar-site build`.

## Data And Storage

- [ ] Create production D1 database and replace `apps/calendar-site/wrangler.toml` `database_id`.
- [ ] Create preview D1 database if preview deploys need persistent data.
- [ ] Create R2 bucket `calendar-site-media` and preview bucket `calendar-site-media-preview`, or update `wrangler.toml` names.
- [ ] Configure `MEDIA_PUBLIC_BASE=https://media.pdx.fun`.
- [ ] Apply migrations through `packages/calendar/migrations/sql`, including tenant invite migration `0031_calendar_tenant_invites.sql`.
- [ ] Complete `docs/release/data-cutover.md`.

## Auth

- [ ] Google OAuth redirect: `https://pdx.fun/auth/google/callback`.
- [ ] Apple OAuth redirect if enabled: `https://pdx.fun/auth/apple/callback`.
- [ ] Calendar provider OAuth redirect: `https://pdx.fun/api/calendar/oauth-callback`.
- [ ] `TOKEN_ENC_KEY` is set before any provider tokens are stored.
- [ ] Confirm invite/login redirects use `/login` and clean root program URLs.
- [ ] Confirm registered users get an organizer page at `/t/<slug>`.
- [ ] Confirm signed-in users can create events from `/events/new`.
- [ ] Confirm signed-in organizers can open `/organizer` and `/organizer/settings`.

## Payments

- [ ] PayPal app origin/callbacks point at `https://pdx.fun`.
- [ ] Square app origin/callbacks point at `https://pdx.fun`.
- [ ] Browser public IDs are set in Pages vars.
- [ ] Server secrets are deployed with `pnpm --dir apps/calendar-site deploy:secrets`.
- [ ] Launch policy: payment providers, payment handles, and payment defaults remain global-admin-managed.

## Cron

- [ ] `CALENDAR_SYNC_CRON_SECRET` is set.
- [ ] Scheduler runs `pnpm --dir apps/calendar-site calendar:sync`.
- [ ] Sync queue health is visible in admin.
- [ ] Production cron includes `Authorization: Bearer $CALENDAR_SYNC_CRON_SECRET`.
- [ ] Launch policy: calendar provider OAuth, sync queue processing, and provider disconnects remain global-admin-managed.

## Anti-Abuse

- [ ] Turnstile site key is set as `PUBLIC_TURNSTILE_SITE_KEY`.
- [ ] Turnstile secret is deployed as `TURNSTILE_SECRET_KEY`.
- [ ] `TURNSTILE_REQUIRED=true`, `TURNSTILE_FAIL_OPEN=false`, and `ANTIABUSE_ENABLED=true` for launch.

## Miko Removal

- [ ] `miko.art/schedule/*` redirects to the calendar domain.
- [ ] `miko.art` no longer has D1/R2 calendar bindings.
- [ ] `miko.art` no longer imports `@calendar/*`.
- [ ] Root e2e no longer targets `/schedule`.

## Launch Evidence

- [ ] Record Pages project id, production deployment id, D1 id, R2 bucket names, OAuth client ids, and payment app ids in the launch ticket.
- [ ] Attach output from `pnpm --dir apps/calendar-site build`.
- [ ] Attach output from a post-deploy smoke of `/`, `/login`, `/register`, `/organizer`, `/organizer/events/<id>`, `/t/pdx-fun`, `/api/calendar/ics`, and `/admin`.

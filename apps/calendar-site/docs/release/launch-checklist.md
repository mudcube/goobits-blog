# Calendar Site Launch Checklist

## DNS And Hosting

- [ ] Create Cloudflare Pages project for `apps/calendar-site`.
- [ ] Set production domain.
- [ ] Set preview domain.
- [ ] Confirm `PUBLIC_BASE_URL`.

## Data And Storage

- [ ] Create production D1 database.
- [ ] Create preview D1 database if needed.
- [ ] Create media R2 bucket.
- [ ] Configure `MEDIA_PUBLIC_BASE`.
- [ ] Complete `docs/release/data-cutover.md`.

## Auth

- [ ] Google OAuth redirect: `/auth/google/callback`.
- [ ] Apple OAuth redirect if enabled: `/auth/apple/callback`.
- [ ] Calendar provider OAuth redirect: `/api/calendar/oauth-callback`.
- [ ] Confirm invite/login redirects use `/login` and clean root program URLs.

## Payments

- [ ] PayPal app origin/callbacks point at the new domain.
- [ ] Square app origin/callbacks point at the new domain.
- [ ] Browser public IDs are set.
- [ ] Server secrets are set.

## Cron

- [ ] `CALENDAR_SYNC_CRON_SECRET` is set.
- [ ] Scheduler runs `pnpm --dir apps/calendar-site calendar:sync`.
- [ ] Sync queue health is visible in admin.

## Miko Removal

- [ ] `miko.art/schedule/*` redirects to the calendar domain.
- [ ] `miko.art` no longer has D1/R2 calendar bindings.
- [ ] `miko.art` no longer imports `@calendar/*`.
- [ ] Root e2e no longer targets `/schedule`.

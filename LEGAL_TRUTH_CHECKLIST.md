# Legal Truth Checklist

Use this checklist before each release that changes data flows, auth, forms, cookies, or vendors.

## 1) Contact and requests
- [ ] `hello@miko.art` is monitored and tested.
- [ ] A data request (access/delete/correct) has an owner and response process.

## 2) What data is collected
- [ ] Contact form fields in policy match what the form actually sends.
- [ ] Booking fields in policy match API/database reality.
- [ ] Auth/session fields in policy match stored user/session data.

## 3) Cookies and storage
- [ ] Cookie names in `/cookies` match actual cookies in browser.
- [ ] Cookie purposes are accurately described (session, invite/redirect, preferences).
- [ ] No undisclosed tracking/ad cookies are set.

## 4) Third parties
- [ ] Every third-party processor/service in use is listed in `/privacy`.
- [ ] Any removed provider is removed from `/privacy`.

## 5) Analytics claim
- [ ] If analytics is enabled, policy says which tool is used.
- [ ] If analytics is disabled, analytics scripts are absent from `src/app.html`.

## 6) Jurisdiction and legal links
- [ ] Governing law in `/terms` is correct.
- [ ] Footer links to `/privacy`, `/terms`, `/cookies`, `/sitemap` work.
- [ ] Legacy legal URLs redirect correctly (e.g. `/privacy-policy` -> `/privacy`).

## 7) Retention and deletion ability
- [ ] Policy retention language still reflects actual operations.
- [ ] You can actually delete requested data from primary stores and key third parties.

## 8) Release validation
- [ ] Run route smoke checks for legal pages and redirects.
- [ ] Run deploy-style build and confirm no new legal-route/prerender issues.
- [ ] Update "Last updated" dates when legal text changes.

## Data location map (current project)
- Contact submissions:
  - External endpoint used by front-end: `https://miko.art/api/email` from `src/routes/contact/+page.svelte`.
- Booking and calendar data (D1/sqlite via migrations):
  - `bookings`, `booking_event_links`, `rate_limits`, `oauth_states` from `packages/calendar/migrations/0001_calendar.sql`.
- Calendar auth/user data:
  - `calendar_users`, `calendar_sessions`, `calendar_oauth_accounts`, `calendar_invites`, `calendar_invite_redemptions` from `packages/calendar/migrations/0004_calendar_auth_rename.sql` and `packages/calendar/migrations/0005_auth_migration.sql`.
- Admin auth data:
  - `admin_users`, `admin_sessions` from `packages/calendar/migrations/0003_admin_sessions_and_cancel_token.sql` and `packages/calendar/migrations/0005_auth_migration.sql`.

Keep this file aligned with schema and legal page changes.

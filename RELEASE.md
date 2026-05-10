# Release Checklist

Current release checklist for the SvelteKit/Cloudflare Pages app.

## Environment

Keep `config/env/.env.example` as the source of truth for required variables. For production changes, update encrypted production env and deploy secrets with:

```bash
pnpm deploy:secrets
```

Important anti-abuse and verification variables:

- `ANTIABUSE_ENABLED=true`
- `PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_REQUIRED=true`
- `TURNSTILE_FAIL_OPEN=true`
- `TURNSTILE_ENABLE_LOCALHOST=false`
- `REGISTRATION_RATE_LIMIT_PER_IP=12`
- `REGISTRATION_RATE_LIMIT_PER_EMAIL=5`
- `REGISTRATION_RATE_LIMIT_PER_DEVICE=8`
- `REGISTRATION_RATE_LIMIT_PER_ASN=30`
- `REGISTRATION_RATE_LIMIT_WINDOW_MS=3600000`
- `DISPOSABLE_EMAIL_BLOCK_MODE=score`
- `EMAIL_VERIFICATION_WEBHOOK_URL`

`TURNSTILE_ENABLE_LOCALHOST=true` is for local visual preview only. In dev it renders the widget and bypasses server-side Turnstile verification.

## Cloudflare Turnstile

1. Create or update the Turnstile widget in Cloudflare Dashboard.
2. Add production domains to the widget allowlist.
3. Add localhost/dev hostnames only when local widget preview is needed.
4. Store the site key in `PUBLIC_TURNSTILE_SITE_KEY`.
5. Store the secret key in `TURNSTILE_SECRET_KEY`.
6. Keep `TURNSTILE_REQUIRED=true` in production unless intentionally rolling back verification.

## OAuth Callback URLs

Ensure these callback URLs are configured in provider dashboards:

- Google/Auth app redirect: `https://<your-domain>/auth/google/callback`
- Local dev auth redirect: `http://localhost:3610/auth/google/callback`
- Calendar admin OAuth callback: `https://<your-domain>/api/calendar/oauth-callback`
- Local dev calendar callback: `http://localhost:3610/api/calendar/oauth-callback`

If callbacks mismatch, Google returns `redirect_uri_mismatch` before app code runs.

## Database

Before release, verify all migrations in `packages/calendar/migrations/sql/` have been applied to the target environment.

Recent release-sensitive migrations include:

- `0006_email_verification_tokens.sql`
- `0014_calendar_user_program_access.sql`
- `0015_calendar_admin_settings.sql`

## Pre-Launch Gate

Run:

```bash
pnpm ci:gate
pnpm audit:css-vars
pnpm build:verify
```

For a broader manual confidence pass, run:

```bash
pnpm e2e:suite
```

## Manual Smoke Checks

Verify these flows after deploy:

- `/register` submits and verification email flow works.
- `/verify-email` accepts valid links and rejects invalid links.
- `/contact` submits successfully.
- `/schedule/login` loads and redirects correctly after auth.
- `/schedule/admin` loads for an authenticated admin.
- Calendar member join, leave, and waitlist flows work.

## Rollback

1. Re-deploy the previous successful Cloudflare Pages build.
2. Re-apply the previous secrets set only if env values changed.
3. Verify auth callback routes.
4. Verify `/schedule/login`, `/schedule`, `/schedule/admin`, `/register`, and `/contact`.

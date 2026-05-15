# @goobits/contact

Reusable contact form core and server helpers for SvelteKit sites.

## What this package owns

- Zod schema for contact submissions (`contactSchema`, `ContactFormData`)
- Default form data builder (`getContactFormDefaults`)
- Request parsing for JSON or form-encoded bodies (`parseContactRequest`)
- Response builders for success/failure that honor JSON-vs-redirect callers (`createContactSuccessResponse`, `createContactFailureResponse`)
- Webhook delivery with timeout, error handling, and dev fallback logging (`deliverContactMessage`)
- Submission orchestration with injectable anti-abuse and delivery callbacks (`submitContactMessage`)

## What the host app owns

- Page UI, copy, and branded form presentation (placeholders, hero text, supporting links)
- Anti-abuse policy (Turnstile, IP/ASN limits, honeypot, device fingerprinting — passed in via the `validateAntiAbuse` callback)
- Webhook configuration: URL, secret, `source`, and `event` identifiers
- Redirect destinations (`successRedirectPath`, `errorRedirectPath`, `invalidBodyRedirectPath`) — typically driven by env vars so the package can be reused without code changes
- Form library integration (e.g. sveltekit-superforms) and route handlers

## Subpath exports

- `@goobits/contact` / `@goobits/contact/core` — schema and pure helpers; safe to import anywhere
- `@goobits/contact/server` — request parsing, response builders, delivery, submission orchestration; server-only

## Usage

```ts
import { contactSchema, getContactFormDefaults } from '@goobits/contact/core'
import {
  parseContactRequest,
  createContactSuccessResponse,
  createContactFailureResponse,
  submitContactMessage,
  deliverContactMessage
} from '@goobits/contact/server'
```

Wire `validateAntiAbuse` and `deliver` callbacks in the host, and pass redirect paths and webhook identifiers from env. Nothing in the package is brand- or hostname-specific.

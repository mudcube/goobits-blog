// @calendar/core root barrel.
//
// This entry intentionally exposes only the tiny set of cross-domain
// utilities that don't fit under any single sub-entry. Everything else
// lives in a focused sub-entry — import from there to make intent
// explicit:
//
//   @calendar/core/admin     → permissions, bootstrap, prefs, programs,
//                               event-detail, payment defaults
//   @calendar/core/booking   → events feed, join/leave, confirmations,
//                               templates, waitlist, member pages
//   @calendar/core/sync      → sync queue + active-provider settings
//   @calendar/core/providers → Google / Outlook / Apple integrations
//   @calendar/core/transport → request-validation parsers + errors
//   @calendar/core/config    → calendar config + activity catalog +
//                               program-slug helpers + venue tz + env
//   @calendar/core/storage   → D1 connections, OAuth state, rate limit
//   @calendar/core/invites   → invite generate/validate/consume +
//                               user-program-access
//   @calendar/core/payments  → checkout, payment-link, admin defaults
//   @calendar/core/weather   → weather provider abstraction + impls
//   @calendar/core/media     → hero image upload helpers
//
// New code should NOT add re-exports to this file; add them to the
// matching sub-entry instead. The flat root used to mirror everything
// for legacy reasons; it has now been pared back to the few items
// that genuinely cross every domain.

export { isoDay } from './utils/time.ts'
export { toErrorResponse } from './utils/errors.ts'

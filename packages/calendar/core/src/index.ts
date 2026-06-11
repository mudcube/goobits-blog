// @calendar/core root.
//
// Intentionally empty — every export lives under a focused sub-entry.
// Pick the matching one for the import you need:
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
//   @calendar/core/tenants   → organizer tenants + membership helpers
//   @calendar/core/weather   → weather provider abstraction + impls
//   @calendar/core/media     → hero image upload helpers
//   @calendar/core/utils     → tiny cross-domain helpers (isoDay,
//                               toErrorResponse)
//
// New code should NOT add re-exports to this file; add them to the
// matching sub-entry instead.

export {}

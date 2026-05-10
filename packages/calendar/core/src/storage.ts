// Storage sub-entry for @calendar/core.
//
// Connection records, OAuth state, rate limiting, user listing — all the
// raw D1 helpers. Higher-level domain operations (bookings, programs,
// invites, etc.) live in their own sub-entries on top of these primitives.

export {
	getConnection,
	saveConnection,
	deleteConnection,
	createOauthState,
	consumeOauthState,
	checkRateLimit,
	listCalendarUsers
} from './storage/d1.ts'

// Providers sub-entry for @calendar/core.
//
// Calendar provider integrations (Google, Outlook, Apple CalDAV). Sync queue
// + active-provider state lives in @calendar/core/sync.

export {
	getGoogleAuthUrl,
	exchangeGoogleCode,
	ensureValidGoogleToken,
	googleFreeBusy,
	googleCreateEvent,
	googleDeleteEvent,
	DEFAULT_SCOPES
} from './providers/google/index.ts'

export {
	getOutlookAuthUrl,
	exchangeOutlookCode,
	ensureValidOutlookToken,
	outlookCreateEvent,
	outlookDeleteEvent,
	OUTLOOK_SCOPES
} from './providers/outlook/index.ts'

export {
	appleCreateEvent,
	appleDeleteEvent,
	buildAppleEventIcs,
	type AppleCalDavConnection,
	type AppleCalendarEventInput
} from './providers/apple/caldav.ts'

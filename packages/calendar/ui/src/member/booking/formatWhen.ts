import { VENUE_TIMEZONE } from '@calendar/core'

const LOCALE = 'en-US'
// Explicit timeZone keeps SSR/CSR formatting deterministic (avoids hydration mismatch / CLS).
// If you want per-user time zones later, render raw ISO on SSR and format client-only.
// VENUE_TIMEZONE is the canonical venue TZ — defined once in @calendar/core/config/venue.
const TIME_ZONE = VENUE_TIMEZONE

const dayFmt = new Intl.DateTimeFormat(LOCALE, {
	timeZone: TIME_ZONE,
	weekday: 'short',
	month: 'short',
	day: 'numeric'
})

const timeFmt = new Intl.DateTimeFormat(LOCALE, {
	timeZone: TIME_ZONE,
	hour: 'numeric',
	minute: '2-digit'
})

export function formatWhen(startIso: string, endIso: string) {
	const start = new Date(startIso)
	const end = new Date(endIso)
	return `${dayFmt.format(start)} · ${timeFmt.format(start)}-${timeFmt.format(end)}`
}


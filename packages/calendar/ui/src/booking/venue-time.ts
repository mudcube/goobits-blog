export const VENUE_TIMEZONE = 'America/Los_Angeles'

const venueDateFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: VENUE_TIMEZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
})

const venueTimeFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: VENUE_TIMEZONE,
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
})

function partsByType(parts: Intl.DateTimeFormatPart[]) {
	return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

export function venueDayKey(iso: string | Date): string {
	const parts = partsByType(venueDateFormatter.formatToParts(new Date(iso)))
	return `${parts['year']}-${parts['month']}-${parts['day']}`
}

export function venueDayDate(isoOrDayKey: string | Date): Date {
	const dayKey = isoOrDayKey instanceof Date || isoOrDayKey.includes('T')
		? venueDayKey(isoOrDayKey)
		: isoOrDayKey
	return new Date(`${dayKey}T12:00:00Z`)
}

export function venueDecimalHour(iso: string): number {
	const parts = partsByType(venueTimeFormatter.formatToParts(new Date(iso)))
	const hour = Number(parts['hour'] ?? 0)
	const minute = Number(parts['minute'] ?? 0)
	return (hour === 24 ? 0 : hour) + minute / 60
}

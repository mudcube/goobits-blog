/**
 * Canonical Intl options for the calendar UI. Hoisted to constants because
 * the same shape was hand-rolled inline in 11+ places across booking,
 * admin, and event detail surfaces.
 */
export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	hour: 'numeric',
	minute: '2-digit'
}

export const TIME_FORMAT_24H_OPTIONS: Intl.DateTimeFormatOptions = {
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
}

export const DAY_LABEL_OPTIONS: Intl.DateTimeFormatOptions = {
	weekday: 'short',
	month: 'short',
	day: 'numeric'
}

export function formatEventDayLabel(iso: string) {
	const date = new Date(iso)
	return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }).toUpperCase()
}

export function formatEventTimeLabel(iso: string) {
	return new Date(iso).toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS).replace(' ', '').toLowerCase()
}

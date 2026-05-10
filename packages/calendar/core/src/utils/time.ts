export function toIsoString(date: string | number | Date) {
	return new Date(date).toISOString()
}

/**
 * Format a Date as `YYYY-MM-DD` using the runtime's local timezone — used
 * as a stable map key for "this calendar day". Pair with venueDayKey when
 * the day must be anchored to the venue TZ rather than the user's clock.
 */
export function isoDay(date: Date): string {
	const y = date.getFullYear()
	const m = `${date.getMonth() + 1}`.padStart(2, '0')
	const d = `${date.getDate()}`.padStart(2, '0')
	return `${y}-${m}-${d}`
}

export function addMinutes(isoString: string, minutes: number) {
	const date = new Date(isoString)
	date.setMinutes(date.getMinutes() + minutes)
	return date.toISOString()
}

export function overlaps(
	aStart: string | number | Date,
	aEnd: string | number | Date,
	bStart: string | number | Date,
	bEnd: string | number | Date
) {
	return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

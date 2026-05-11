/**
 * Pure date-comparison helpers used by both booking and admin surfaces.
 * Kept tiny and dependency-free so any component can import without
 * dragging in a runes-class controller or barrel.
 *
 * All comparisons are local-time based. For venue-anchored comparisons
 * (e.g., "which events are on the same day in PT regardless of the
 * viewer's timezone"), use `venueDayKey` from `@calendar/ui/booking`.
 */

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}

export function isToday(date: Date): boolean {
	return isSameDay(date, new Date())
}

export function isPast(date: Date): boolean {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	return date < today
}

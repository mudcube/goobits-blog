/**
 * Venue-local time utilities. The venue runs in a fixed IANA timezone; events
 * are stored as UTC ISO strings but recurrence semantics ("every Saturday at
 * 9am") are anchored to the venue's wall clock, not UTC.
 *
 * This is the canonical home for `VENUE_TIMEZONE` — UI helpers in
 * `@calendar/ui/src/booking/venue-time.ts` re-export from here.
 */

export const VENUE_TIMEZONE = 'America/Los_Angeles'

const venueClockFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: VENUE_TIMEZONE,
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
})

function venueLocalClock(date: Date): { hour: number; minute: number } {
	const parts = Object.fromEntries(
		venueClockFormatter.formatToParts(date).map((p) => [p.type, p.value])
	)
	return {
		hour: Number(parts['hour'] ?? 0) % 24,
		minute: Number(parts['minute'] ?? 0)
	}
}

/**
 * Add N weeks to a UTC ISO timestamp while preserving the venue-local wall
 * clock — i.e., a 9am-PT class that recurs across the spring-forward DST
 * transition stays at 9am-PT after the shift, not 10am-PT or 8am-PT.
 *
 * Algorithm: add 7*N days of milliseconds (the naive shift, which lands on
 * the right calendar day in venue local time but may drift the wall clock
 * by ±1 hour after a DST transition), then nudge by the drift so the venue-
 * local clock matches the original.
 *
 * Edge cases: if the resulting wall clock would land in the DST spring-
 * forward gap (e.g., 2:30am on the second Sunday of March), browsers/Node
 * resolve to the next valid instant — close enough for our purposes; admins
 * can correct individual events afterward.
 */
export function addWeeksInVenueTime(iso: string, weeks: number): string {
	if (weeks === 0) return iso
	const original = new Date(iso)
	const candidate = new Date(original.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
	const orig = venueLocalClock(original)
	const cand = venueLocalClock(candidate)
	let driftMinutes = (cand.hour - orig.hour) * 60 + (cand.minute - orig.minute)
	// Normalize the drift to (-12h, +12h]. DST shifts are ±1h so this guards
	// against day-boundary wraparound (e.g., 23:00 vs 01:00 reading as -22h).
	if (driftMinutes > 720) driftMinutes -= 1440
	if (driftMinutes <= -720) driftMinutes += 1440
	if (driftMinutes === 0) return candidate.toISOString()
	return new Date(candidate.getTime() - driftMinutes * 60 * 1000).toISOString()
}

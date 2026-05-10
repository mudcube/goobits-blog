/**
 * Venue-local time utilities. Events are stored as UTC ISO strings; recurrence
 * semantics ("every Saturday at 9am") are anchored to a wall clock in some
 * IANA timezone — historically the venue's fixed timezone, now stored
 * per-event so the system can support travel events / multi-venue layouts
 * without losing DST safety.
 *
 * `VENUE_TIMEZONE` is the default for events that don't specify their own
 * timezone (legacy events backfilled by migration 0028, and any new event
 * created without an explicit timezone). UI helpers in
 * `@calendar/ui/src/booking/venue-time.ts` re-export this constant.
 */

export const VENUE_TIMEZONE = 'America/Los_Angeles'

// Cache one Intl.DateTimeFormat per timezone — these objects aren't free to
// construct and recurrence loops can call this hundreds of times per request.
const clockFormatters = new Map<string, Intl.DateTimeFormat>()

function clockFormatter(tz: string): Intl.DateTimeFormat {
	let fmt = clockFormatters.get(tz)
	if (fmt) return fmt
	fmt = new Intl.DateTimeFormat('en-GB', {
		timeZone: tz,
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	})
	clockFormatters.set(tz, fmt)
	return fmt
}

function localClock(date: Date, tz: string): { hour: number; minute: number } {
	const parts = Object.fromEntries(
		clockFormatter(tz).formatToParts(date).map((p) => [p.type, p.value])
	)
	return {
		hour: Number(parts['hour'] ?? 0) % 24,
		minute: Number(parts['minute'] ?? 0)
	}
}

/**
 * Add N weeks to a UTC ISO timestamp while preserving the wall clock in the
 * given IANA timezone — i.e., a 9am recurrence in `America/Los_Angeles`
 * stays at 9am-PT across the spring-forward DST transition rather than
 * sliding to 10am-PT or 8am-PT.
 *
 * Algorithm: add 7*N days of milliseconds (the naive shift, which lands on
 * the right calendar day in local time but may drift the wall clock by ±1
 * hour after a DST transition), then nudge by the drift so the local clock
 * matches the original.
 *
 * Edge cases: if the resulting wall clock would land in the DST spring-
 * forward gap (e.g., 2:30am on the second Sunday of March), browsers/Node
 * resolve to the next valid instant — close enough for our purposes; admins
 * can correct individual events afterward.
 */
export function addWeeksInTimezone(iso: string, weeks: number, tz: string): string {
	if (weeks === 0) return iso
	const original = new Date(iso)
	const candidate = new Date(original.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
	const orig = localClock(original, tz)
	const cand = localClock(candidate, tz)
	let driftMinutes = (cand.hour - orig.hour) * 60 + (cand.minute - orig.minute)
	// Normalize the drift to (-12h, +12h]. DST shifts are ±1h so this guards
	// against day-boundary wraparound (e.g., 23:00 vs 01:00 reading as -22h).
	if (driftMinutes > 720) driftMinutes -= 1440
	if (driftMinutes <= -720) driftMinutes += 1440
	if (driftMinutes === 0) return candidate.toISOString()
	return new Date(candidate.getTime() - driftMinutes * 60 * 1000).toISOString()
}

/**
 * Convenience wrapper: same as `addWeeksInTimezone` but using the venue
 * default. Kept for back-compat with callers that haven't been updated to
 * pass a timezone yet.
 */
export function addWeeksInVenueTime(iso: string, weeks: number): string {
	return addWeeksInTimezone(iso, weeks, VENUE_TIMEZONE)
}

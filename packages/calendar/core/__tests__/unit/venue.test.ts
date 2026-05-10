import { describe, expect, it } from 'vitest'
import {
	addWeeksInTimezone,
	addWeeksInVenueTime,
	VENUE_TIMEZONE
} from '../../src/config/venue'

const venueClock = new Intl.DateTimeFormat('en-GB', {
	timeZone: VENUE_TIMEZONE,
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
})

function localHourMin(iso: string): string {
	const parts = Object.fromEntries(venueClock.formatToParts(new Date(iso)).map((p) => [p.type, p.value]))
	return `${parts['hour']}:${parts['minute']}`
}

describe('addWeeksInVenueTime', () => {
	it('returns input unchanged for weeks=0', () => {
		const iso = '2026-05-09T16:00:00.000Z'
		expect(addWeeksInVenueTime(iso, 0)).toBe(iso)
	})

	it('preserves wall clock across normal weeks (no DST transition)', () => {
		// 9am venue local on a regular PDT week.
		const start = '2026-05-09T16:00:00.000Z' // 9:00 PDT
		const result = addWeeksInVenueTime(start, 2)
		expect(localHourMin(result)).toBe(localHourMin(start))
	})

	it('preserves wall clock across spring-forward DST transition', () => {
		// In 2026, US DST starts Sunday March 8 (clocks jump 02:00 → 03:00).
		// Anchor: 9:00 PST on March 7 (= 17:00 UTC).
		const start = '2026-03-07T17:00:00.000Z'
		expect(localHourMin(start)).toBe('09:00')
		// One week later (March 14) is in PDT. Naive add-7-days gives 17:00 UTC =
		// 10:00 PDT — wrong. Helper should land at 16:00 UTC = 9:00 PDT.
		const result = addWeeksInVenueTime(start, 1)
		expect(localHourMin(result)).toBe('09:00')
		expect(result).toBe('2026-03-14T16:00:00.000Z')
	})

	it('preserves wall clock across fall-back DST transition', () => {
		// In 2026, US DST ends Sunday November 1 (clocks fall 02:00 → 01:00).
		// Anchor: 9:00 PDT on Oct 31 (= 16:00 UTC).
		const start = '2026-10-31T16:00:00.000Z'
		expect(localHourMin(start)).toBe('09:00')
		// One week later (Nov 7) is in PST. Naive add-7-days gives 16:00 UTC =
		// 8:00 PST — wrong. Helper should land at 17:00 UTC = 9:00 PST.
		const result = addWeeksInVenueTime(start, 1)
		expect(localHourMin(result)).toBe('09:00')
		expect(result).toBe('2026-11-07T17:00:00.000Z')
	})

	it('handles multi-week recurrence that crosses DST', () => {
		// Start 4 weeks before spring-forward (Feb 8 = 17:00 UTC = 9:00 PST).
		const start = '2026-02-08T17:00:00.000Z'
		// Week 1, 2, 3 are still PST. Week 4 lands on March 8 — DST transition day.
		// Week 5 (March 15) is in PDT.
		const week5 = addWeeksInVenueTime(start, 5)
		expect(localHourMin(week5)).toBe('09:00')
	})
})

describe('addWeeksInTimezone (per-event timezone)', () => {
	const nyClock = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'America/New_York',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	})
	const nyHourMin = (iso: string) => {
		const parts = Object.fromEntries(
			nyClock.formatToParts(new Date(iso)).map((p) => [p.type, p.value])
		)
		return `${parts['hour']}:${parts['minute']}`
	}

	it('preserves wall clock in non-default timezones across DST', () => {
		// 2026 spring-forward in US Eastern: clocks jump 2026-03-08 02:00 → 03:00.
		// Anchor: 9am ET on March 7 (= 14:00 UTC, EST).
		const start = '2026-03-07T14:00:00.000Z'
		expect(nyHourMin(start)).toBe('09:00')
		const result = addWeeksInTimezone(start, 1, 'America/New_York')
		expect(nyHourMin(result)).toBe('09:00')
		// March 14 in NY is in EDT (UTC-4), so 9am ET = 13:00 UTC.
		expect(result).toBe('2026-03-14T13:00:00.000Z')
	})

	it('addWeeksInVenueTime delegates to the venue timezone', () => {
		const start = '2026-03-07T17:00:00.000Z'
		const wrapped = addWeeksInVenueTime(start, 1)
		const direct = addWeeksInTimezone(start, 1, VENUE_TIMEZONE)
		expect(wrapped).toBe(direct)
	})
})

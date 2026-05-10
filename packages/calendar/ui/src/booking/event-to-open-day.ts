import type { CalendarFeedEvent } from '@calendar/core'
import type { OpenDay, Person } from './types'
import { venueDayDate, venueDayKey, venueDecimalHour } from './venue-time'

const PERSON_COLORS = [
	'#d4748c',
	'#d8944a',
	'#6bb5a0',
	'#7a9ed4',
	'#b07ad4',
	'#d47a7a',
	'#7ad4c4',
	'#c4a84a',
	'#8a7ad4',
	'#4ab5d8'
]

export function eventToOpenDay(
	events: CalendarFeedEvent[],
	activitySlug: string
): OpenDay[] {
	const byDate = new Map<string, CalendarFeedEvent[]>()

	for (const ev of events) {
		if (activitySlug && ev.activitySlug !== activitySlug) continue
		const dateKey = venueDayKey(ev.startsAt)
		const existing = byDate.get(dateKey) ?? []
		existing.push(ev)
		byDate.set(dateKey, existing)
	}

	const days: OpenDay[] = []
	for (const [dateStr, dayEvents] of byDate) {
		// Span the full booking window across all events for the day so days
		// with multiple sessions show the full availability, not just the
		// first session's window.
		let windowStart = Infinity
		let windowEnd = -Infinity
		for (const ev of dayEvents) {
			windowStart = Math.min(windowStart, venueDecimalHour(ev.startsAt))
			windowEnd = Math.max(windowEnd, venueDecimalHour(ev.endsAt))
		}

		const bookings: Person[] = []
		for (const ev of dayEvents) {
			for (const p of ev.participants) {
				bookings.push({
					name: p.name ?? 'Guest',
					color: PERSON_COLORS[bookings.length % PERSON_COLORS.length]!,
					start: venueDecimalHour(ev.startsAt),
					end: venueDecimalHour(ev.endsAt)
				})
			}
		}

		const first = dayEvents[0]!
		days.push({
			date: venueDayDate(dateStr),
			eventId: first.id,
			bookings,
			windowStart,
			windowEnd,
			maxDuration: Math.min(windowEnd - windowStart, 4),
			capacity: first.capacity
		})
	}

	return days.sort((a, b) => a.date.getTime() - b.date.getTime())
}

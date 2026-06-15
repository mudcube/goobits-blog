import type { OpenDay, Person } from './types'

export type Activity = {
	slug: string; label: string; icon: string; tagline: string
	windowStart: number; windowEnd: number; maxDuration: number; capacity: number
}

function makeDate(n: number) { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(0, 0, 0, 0); return d }

/** Build demo open days for testing. Pass your own activity and people. */
export function buildMockOpenDays(activity: Activity, people: Person[] = []): OpenDay[] {
	const days: OpenDay[] = []
	for (let i = 1; i <= 21; i++) {
		const d = makeDate(i)
		if (![1, 3, 5].includes(d.getDay())) continue
		const bookings: Person[] = i <= 7 ? [...people] : i <= 14 ? [people[0]!].filter(Boolean) : []
		days.push({ date: d, bookings, windowStart: activity.windowStart, windowEnd: activity.windowEnd, maxDuration: activity.maxDuration, capacity: activity.capacity })
	}
	return days
}

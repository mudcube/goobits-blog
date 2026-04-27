import type { OpenDay, Person } from './types'

export type Activity = {
	slug: string; label: string; icon: string; tagline: string
	windowStart: number; windowEnd: number; maxDuration: number; capacity: number
}

export const GYM: Activity = {
	slug: 'gym', label: 'Rainbow Gym', icon: '💪',
	tagline: 'Hang out. Work out. Whatever.',
	windowStart: 10, windowEnd: 20, maxDuration: 2, capacity: 8,
}

const PEOPLE: Person[] = [
	{ name: 'Jen', color: '#d4748c', start: 12, end: 14 },
	{ name: 'Tyler', color: '#d8944a', start: 13, end: 15 },
]

function makeDate(n: number) { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(0, 0, 0, 0); return d }

export function buildOpenDays(activity: Activity): OpenDay[] {
	const days: OpenDay[] = []
	for (let i = 1; i <= 21; i++) {
		const d = makeDate(i)
		if (![1, 3, 5].includes(d.getDay())) continue
		const bookings: Person[] = i <= 7 ? [...PEOPLE] : i <= 14 ? [PEOPLE[0]!] : []
		days.push({ date: d, bookings, windowStart: activity.windowStart, windowEnd: activity.windowEnd, maxDuration: activity.maxDuration, capacity: activity.capacity })
	}
	return days
}


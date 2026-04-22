import { createMockWeatherProvider } from '$lib/app/weather'

export type Person = { name: string; color: string; start: number; end: number }
export type OpenDay = { date: Date; bookings: Person[]; windowStart: number; windowEnd: number; maxDuration: number; capacity: number }

export type Activity = {
	slug: string; label: string; icon: string; tagline: string; subtitle: string
	windowStart: number; windowEnd: number; maxDuration: number; capacity: number
}

export const GYM: Activity = {
	slug: 'gym', label: 'Rainbow Gym', icon: '💪',
	tagline: 'Hang out. Work out. Whatever.',
	subtitle: 'Grab a time slot and let\'s do something fun together.',
	windowStart: 10, windowEnd: 20, maxDuration: 2, capacity: 8,
}

const PEOPLE: Person[] = [
	{ name: 'Jen', color: '#d4748c', start: 12, end: 14 },
	{ name: 'Tyler', color: '#d8944a', start: 13, end: 15 },
]

function makeDate(daysFromNow: number) {
	const d = new Date(); d.setDate(d.getDate() + daysFromNow); d.setHours(0, 0, 0, 0); return d
}

export function buildOpenDays(activity: Activity): OpenDay[] {
	const days: OpenDay[] = []
	for (let i = 1; i <= 21; i++) {
		const d = makeDate(i)
		const dow = d.getDay()
		if (![1, 3, 5].includes(dow)) continue // Mon/Wed/Fri
		const bookings: Person[] = i <= 7 ? [...PEOPLE] : i <= 14 ? [PEOPLE[0]!] : []
		days.push({ date: d, bookings, windowStart: activity.windowStart, windowEnd: activity.windowEnd, maxDuration: activity.maxDuration, capacity: activity.capacity })
	}
	return days
}

export const weather = createMockWeatherProvider()

export function getWeatherForDate(dateStr: string) {
	return weather.getDay(dateStr)
}

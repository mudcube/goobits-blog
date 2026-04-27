import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { buildEnv } from '@calendar/kit'
import { listUpcomingEvents, fetchWeatherForEvent } from '@calendar/core'
import type { CalendarFeedEvent } from '@calendar/core'
import type { OpenDay, Person } from '@calendar/ui'

const PERSON_COLORS = [
	'#d4748c', '#d8944a', '#6bb5a0', '#7a9ed4', '#b07ad4',
	'#d47a7a', '#7ad4c4', '#c4a84a', '#8a7ad4', '#4ab5d8',
]

function isoToDecimalHour(iso: string): number {
	const d = new Date(iso)
	return d.getHours() + d.getMinutes() / 60
}

function eventToOpenDay(events: CalendarFeedEvent[], activitySlug: string): OpenDay[] {
	const byDate = new Map<string, CalendarFeedEvent[]>()

	for (const ev of events) {
		if (activitySlug && ev.activitySlug !== activitySlug) continue
		const dateKey = ev.startsAt.split('T')[0]!
		const existing = byDate.get(dateKey) ?? []
		existing.push(ev)
		byDate.set(dateKey, existing)
	}

	const days: OpenDay[] = []
	for (const [dateStr, dayEvents] of byDate) {
		// Use the first event's window as the day's window
		const first = dayEvents[0]!
		const windowStart = isoToDecimalHour(first.startsAt)
		const windowEnd = isoToDecimalHour(first.endsAt)

		const bookings: Person[] = []
		for (const ev of dayEvents) {
			for (const p of ev.participants) {
				bookings.push({
					name: p.name ?? 'Guest',
					color: PERSON_COLORS[bookings.length % PERSON_COLORS.length]!,
					start: isoToDecimalHour(ev.startsAt),
					end: isoToDecimalHour(ev.endsAt),
				})
			}
		}

		days.push({
			date: new Date(dateStr + 'T00:00:00'),
			bookings,
			windowStart,
			windowEnd,
			maxDuration: Math.min(windowEnd - windowStart, 4),
			capacity: first.capacity,
		})
	}

	return days.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export const load: PageServerLoad = async ({ locals, url, platform }) => {
	const user = (locals as { user?: { id: string; name: string } }).user
	if (!user) {
		const loginUrl = `/schedule/login?redirect=${encodeURIComponent(url.pathname)}`
		redirect(302, loginUrl)
	}

	const activitySlug = url.searchParams.get('activity') ?? 'gym'
	const isMock = url.searchParams.get('mock') === '1'

	// In mock mode, return empty data — the page falls back to mock weather
	if (isMock) {
		return {
			activity: {
				slug: activitySlug,
				label: activitySlug.charAt(0).toUpperCase() + activitySlug.slice(1),
				icon: '💪',
				tagline: '',
				windowStart: 10,
				windowEnd: 20,
				maxDuration: 4,
				capacity: 8,
			},
			openDays: [],
			weatherMap: {},
			userName: user.name ?? 'Mock User',
			useMockData: true,
		}
	}

	try {
		const env = await buildEnv(platform)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const db = env['db'] as any
		const events = await listUpcomingEvents(db, user.id)
		const openDays = eventToOpenDay(events, activitySlug)

		// Fetch weather for each day (best-effort, don't block on failure)
		const weatherMap: Record<string, { sunrise: number; sunset: number; hourly: unknown[] }> = {}
		for (const day of openDays.slice(0, 7)) {
			const dateStr = day.date.toISOString().split('T')[0]!
			try {
				const snapshot = await fetchWeatherForEvent({ startsAt: `${dateStr}T12:00:00` })
				if (snapshot) {
					weatherMap[dateStr] = {
						sunrise: 6.5,  // TODO: get from Open-Meteo daily data
						sunset: 20.0,
						hourly: [],    // TODO: get hourly forecast
					}
				}
			} catch { /* weather is best-effort */ }
		}

		return {
			activity: {
				slug: activitySlug,
				label: activitySlug.charAt(0).toUpperCase() + activitySlug.slice(1),
				icon: '💪',
				tagline: '',
				windowStart: 10,
				windowEnd: 20,
				maxDuration: 4,
				capacity: 8,
			},
			openDays,
			weatherMap,
			userName: user.name ?? 'Guest',
			useMockData: false,
		}
	} catch {
		// Fallback: return empty state if DB isn't available
		return {
			activity: {
				slug: activitySlug,
				label: activitySlug.charAt(0).toUpperCase() + activitySlug.slice(1),
				icon: '💪',
				tagline: '',
				windowStart: 10,
				windowEnd: 20,
				maxDuration: 4,
				capacity: 8,
			},
			openDays: [],
			weatherMap: {},
			userName: 'Guest',
		}
	}
}

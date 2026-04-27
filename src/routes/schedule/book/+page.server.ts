import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { buildEnv } from '@calendar/kit'
import { listUpcomingEvents, fetchDayForecast } from '@calendar/core'
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
			eventId: first.id,
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

		// Fetch weather for each day (best-effort, parallel, don't block on failure)
		// Portland, OR coordinates as default
		const lat = 45.52
		const lon = -122.68
		const weatherMap: Record<string, { sunrise: number; sunset: number; hourly: unknown[] }> = {}
		const weatherPromises = openDays.slice(0, 7).map(async (day) => {
			const dateStr = day.date.toISOString().split('T')[0]!
			try {
				const forecast = await fetchDayForecast({ date: dateStr, lat, lon })
				if (forecast) {
					weatherMap[dateStr] = {
						sunrise: forecast.sunrise,
						sunset: forecast.sunset,
						hourly: forecast.hourly,
					}
				}
			} catch { /* weather is best-effort */ }
		})
		await Promise.all(weatherPromises)

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

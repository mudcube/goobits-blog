import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { buildEnv } from '@calendar/kit'
import { listUpcomingEvents, fetchDayForecast } from '@calendar/core'
import { isScheduleDesignMode } from '$lib/app/schedule/design-mode'
import type { CalendarFeedEvent } from '@calendar/core'
import type { OpenDay, Person } from '@calendar/ui'

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

const VENUE_TIMEZONE = 'America/Los_Angeles'
const venueDayFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: VENUE_TIMEZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
})
const venueHourFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: VENUE_TIMEZONE,
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
})

function venueDayKey(iso: string): string {
	return venueDayFormatter.format(new Date(iso))
}

function venueDecimalHour(iso: string): number {
	const parts = venueHourFormatter.formatToParts(new Date(iso))
	const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
	const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
	return (h === 24 ? 0 : h) + m / 60
}

function eventToOpenDay(events: CalendarFeedEvent[], activitySlug: string): OpenDay[] {
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
		// Use the first event's window as the day's window
		const first = dayEvents[0]!
		const windowStart = venueDecimalHour(first.startsAt)
		const windowEnd = venueDecimalHour(first.endsAt)

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

		days.push({
			date: new Date(dateStr + 'T12:00:00Z'),
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

export const load: PageServerLoad = async ({ locals, url, platform }) => {
	const user = (locals as { user?: { id: string; name: string } }).user
	if (!user) {
		const loginUrl = `/schedule/login?redirect=${encodeURIComponent(url.pathname)}`
		redirect(302, loginUrl)
	}

	const activitySlug = url.searchParams.get('activity') ?? 'gym'
	const isMock = isScheduleDesignMode(url)

	// In mock mode, return empty data - the page falls back to mock weather
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
				capacity: 8
			},
			openDays: [],
			weatherMap: {},
			userName: user.name ?? 'Mock User',
			useMockData: true
		}
	}

	const env = await buildEnv(platform)
	const events = await listUpcomingEvents(env.DB, user.id)
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
					hourly: forecast.hourly
				}
			}
		} catch {
			/* weather is best-effort */
		}
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
			capacity: 8
		},
		openDays,
		weatherMap,
		userName: user.name ?? 'Guest',
		useMockData: false
	}
}

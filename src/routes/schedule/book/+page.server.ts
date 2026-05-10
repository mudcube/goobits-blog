import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { buildEnv } from '@calendar/kit'
import { listUpcomingEvents } from '@calendar/core/booking'
import { fetchDayForecast } from '@calendar/core/weather'
import { isScheduleDesignMode } from '$lib/app/schedule/design-mode'
import { eventToOpenDay } from '@calendar/ui'

const PORTLAND_LAT = 45.52
const PORTLAND_LON = -122.68

const DEFAULT_ACTIVITY = {
	icon: '💪',
	tagline: '',
	windowStart: 10,
	windowEnd: 20,
	maxDuration: 4,
	capacity: 8
} as const

export const load: PageServerLoad = async ({ locals, url, platform }) => {
	const user = (locals as { user?: { id: string; name: string } }).user
	if (!user) {
		const loginUrl = `/schedule/login?redirect=${encodeURIComponent(url.pathname)}`
		redirect(302, loginUrl)
	}

	const activitySlug = url.searchParams.get('activity') ?? 'gym'
	const activity = {
		slug: activitySlug,
		label: activitySlug.charAt(0).toUpperCase() + activitySlug.slice(1),
		...DEFAULT_ACTIVITY
	}

	if (isScheduleDesignMode(url)) {
		return {
			activity,
			openDays: [],
			weatherMap: {},
			userName: user.name ?? 'Mock User',
			useMockData: true
		}
	}

	const env = await buildEnv(platform)
	const events = await listUpcomingEvents(env.DB, user.id)
	const openDays = eventToOpenDay(events, activitySlug)

	const weatherMap: Record<string, { sunrise: number; sunset: number; hourly: unknown[] }> = {}
	await Promise.all(
		openDays.slice(0, 7).map(async (day) => {
			const dateStr = day.date.toISOString().split('T')[0]!
			try {
				const forecast = await fetchDayForecast({ date: dateStr, lat: PORTLAND_LAT, lon: PORTLAND_LON })
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
	)

	return {
		activity,
		openDays,
		weatherMap,
		userName: user.name ?? 'Guest',
		useMockData: false
	}
}

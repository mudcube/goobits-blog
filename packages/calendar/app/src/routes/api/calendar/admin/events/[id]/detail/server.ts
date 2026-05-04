import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { fetchWeatherForEvent, getAdminEventDetail, parsePositiveInteger } from '@calendar/core'
import { apiError, apiOk } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.events.detail.get', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const eventId = parsePositiveInteger(event.params['id'])
		if (!eventId) return apiError('Invalid event id', { status: 400 })

		const env = await buildEnv(event.platform)
		const db = env.DB
		const detail = await getAdminEventDetail(db, eventId)
		if (!detail) return apiError('Event not found', { status: 404 })

		const weather = await fetchWeatherForEvent({
			startsAt: detail.event.startsAt,
			lat: (env['WEATHER_LAT'] as string | undefined) ?? null,
			lon: (env['WEATHER_LON'] as string | undefined) ?? null
		})

		return apiOk({ ...detail, weather })
	})
}

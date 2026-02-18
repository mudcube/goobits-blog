import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import { fetchWeatherForEvent, getAdminEventDetail } from '@calendar/core'
import { apiError, apiOk, logApiError } from '@calendar/kit'
import { requireAdminSession, unauthorized } from '@calendar/app/admin-api-helpers'

function parsePositiveInt(value: string | undefined) {
	if (!value) return null
	const parsed = Number.parseInt(value, 10)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export async function GET(event: RequestEvent) {
	try {
		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const eventId = parsePositiveInt(event.params['id'])
		if (!eventId) return apiError('Invalid event id', { status: 400 })

		const { db, env } = await getAdminAuth({ event })
		const detail = await getAdminEventDetail(db, eventId)
		if (!detail) return apiError('Event not found', { status: 404 })

		const weather = await fetchWeatherForEvent({
			startsAt: detail.event.startsAt,
			lat: (env['WEATHER_LAT'] as string | undefined) ?? null,
			lon: (env['WEATHER_LON'] as string | undefined) ?? null
		})

		return apiOk({ ...detail, weather })
	} catch (err) {
		logApiError('admin.events.detail.get', err)
		return apiError('Internal server error')
	}
}

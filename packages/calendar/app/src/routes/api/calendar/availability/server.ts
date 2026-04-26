import {
	getSlotAvailability,
	TransportValidationError
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, buildEnv } from '@calendar/kit'
import type { RequestEvent } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
	try {
		const env = await buildEnv(event.platform)
		const date = event.url.searchParams.get('date')
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return apiError('Missing or invalid date parameter (YYYY-MM-DD)', { status: 400, code: 'invalid_date' })
		}
		const activitySlug = event.url.searchParams.get('activity') ?? undefined

		const slots = await getSlotAvailability(env.DB, { date, activitySlug })
		return apiOk({ slots })
	} catch (error) {
		if (error instanceof TransportValidationError) return apiValidationError(error)
		console.error('Calendar availability query failed:', error)
		return apiError('Internal server error')
	}
}

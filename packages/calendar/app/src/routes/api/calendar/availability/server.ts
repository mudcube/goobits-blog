import {
	getSlotAvailability,
	TransportValidationError
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, buildEnv } from '@calendar/kit'
import type { RequestEvent } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
	try {
		const user = (event.locals as { user?: { id: string | number } }).user
		if (!user?.id) {
			return apiError('Not authenticated', { status: 401, code: 'unauthorized' })
		}

		const env = await buildEnv(event.platform)
		const date = event.url.searchParams.get('date')
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return apiError('Missing or invalid date parameter (YYYY-MM-DD)', { status: 400, code: 'invalid_date' })
		}
		const activitySlug = event.url.searchParams.get('activity')

		const slots = await getSlotAvailability(env.DB, { date, ...(activitySlug ? { activitySlug } : {}) })
		return apiOk({ slots })
	} catch (error) {
		if (error instanceof TransportValidationError) return apiValidationError(error)
		console.error('Calendar availability query failed:', error)
		return apiError('Internal server error')
	}
}

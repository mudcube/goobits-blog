import { getSlotAvailability } from '@calendar/core/booking'
import { TransportValidationError } from '@calendar/core/transport'
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
		if (!activitySlug) {
			return apiError('Missing activity parameter', { status: 400, code: 'missing_activity' })
		}

		const { hasUserProgramAccess } = await import('@calendar/core/invites')
		const hasAccess = await hasUserProgramAccess(env.DB, String(user.id), activitySlug)
		if (!hasAccess) {
			return apiError('Access denied for this program', { status: 403, code: 'forbidden' })
		}

		const slots = await getSlotAvailability(env.DB, { date, activitySlug })
		return apiOk({ slots })
	} catch (error) {
		if (error instanceof TransportValidationError) return apiValidationError(error)
		console.error('Calendar availability query failed:', error)
		return apiError('Internal server error')
	}
}

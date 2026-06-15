import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { leaveEvent } from '@calendar/core/booking'
import { enqueueCalendarSyncJob, processCalendarSyncQueue } from '@calendar/core/sync'
import { parsePositiveInteger } from '@calendar/core/transport'
import { apiError, apiOk, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'
import { enforceSameOrigin } from '@calendar/app/admin-api-helpers'

export async function POST(event: RequestEvent) {
	return runCalendarRequest('calendar.events.leave', async () => {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf
		const user = requireCalendarUserId(event)
		if (user.response) return user.response
		const userId = user.userId

		const eventParam = event.params['id']
		if (!eventParam) {
			return apiError('Missing event id', { status: 400 })
		}
		const eventId = parsePositiveInteger(eventParam)
		if (!eventId) {
			return apiError('Invalid event id', { status: 400 })
		}

		const env = await buildEnv(event.platform)
		const result = await leaveEvent(env.DB, { eventId, userId })
		// Don't block member experience if queue write fails.
		try {
			await enqueueCalendarSyncJob(env.DB, {
				eventId,
				trigger: 'member_leave',
				requestedByUserId: userId
			})
			void processCalendarSyncQueue(env.DB, env, 2).catch((error) => {
				console.warn('Best-effort calendar sync processing failed after leave:', error)
			})
		} catch (error) {
			console.warn('Failed to enqueue calendar sync after leave:', error)
		}
		return apiOk({ state: result.state })
	})
}

import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { enqueueCalendarSyncJob, joinEvent, parseCalendarJoinEventInput, processCalendarSyncQueue, TransportValidationError } from '@calendar/core'
import { apiError, apiOk, apiValidationError, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'

export async function POST(event: RequestEvent) {
	return runCalendarRequest('calendar.events.join', async () => {
		const user = requireCalendarUserId(event)
		if (user.response) return user.response
		const userId = user.userId

		const eventParam = event.params['id']
		if (!eventParam) {
			return apiError('Missing event id', { status: 400 })
		}
		const eventId = Number.parseInt(eventParam, 10)
		if (!Number.isFinite(eventId) || eventId <= 0) {
			return apiError('Invalid event id', { status: 400 })
		}

		const input = parseCalendarJoinEventInput(await event.request.json().catch(() => null))

		const env = await buildEnv(event.platform)
		const result = await joinEvent(env.DB, {
			eventId,
			userId,
			guestCount: input.guestCount,
			note: input.note
		})

		if (!result.ok) {
			const status = result.code === 'forbidden' ? 403 : 404
			return apiError(result.message, { status, code: result.code })
		}

		// Don't block member experience if queue write fails.
		try {
			await enqueueCalendarSyncJob(env.DB, {
				eventId,
				trigger: 'member_join',
				requestedByUserId: userId,
				payload: { guestCount: input.guestCount }
			})
			void processCalendarSyncQueue(env.DB, env, 2).catch((error) => {
				console.warn('Best-effort calendar sync processing failed after join:', error)
			})
		} catch (error) {
			console.warn('Failed to enqueue calendar sync after join:', error)
		}
		return apiOk({ status: result.status, state: result.state })
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}

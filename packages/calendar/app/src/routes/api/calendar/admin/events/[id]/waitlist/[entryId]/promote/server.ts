import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { promoteWaitlistedParticipant } from '@calendar/core/booking'
import { enqueueCalendarSyncJob, processCalendarSyncQueue } from '@calendar/core/sync'
import { parsePositiveInteger } from '@calendar/core/transport'
import { apiError, apiOk } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.events.waitlist.promote', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const eventId = parsePositiveInteger(event.params['id'])
		const entryId = parsePositiveInteger(event.params['entryId'])
		if (!eventId || !entryId) return apiError('Invalid ids', { status: 400 })

		const env = await buildEnv(event.platform)
		const db = env.DB
		const result = await promoteWaitlistedParticipant(db, { eventId, entryId })
		if (result.status === 'not_found') return apiError('Entry not found', { status: 404 })
		if (result.status === 'promoted') {
			try {
				await enqueueCalendarSyncJob(db, {
					eventId,
					trigger: 'admin_waitlist_promote',
					requestedByUserId: null
				})
				void processCalendarSyncQueue(db, env, 2).catch((error) => {
					console.warn('Best-effort calendar sync processing failed after waitlist promote:', error)
				})
			} catch (error) {
				console.warn('Failed to enqueue calendar sync after waitlist promote:', error)
			}
		}
		return apiOk({ status: result.status })
	})
}

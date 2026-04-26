import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import { enqueueCalendarSyncJob, processCalendarSyncQueue, promoteWaitlistedParticipant } from '@calendar/core'
import { apiError, apiOk } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'

function parsePositiveInt(value: string | undefined) {
	if (!value) return null
	const parsed = Number.parseInt(value, 10)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.events.waitlist.promote', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const eventId = parsePositiveInt(event.params['id'])
		const entryId = parsePositiveInt(event.params['entryId'])
		if (!eventId || !entryId) return apiError('Invalid ids', { status: 400 })

		const { db, env } = await getAdminAuth({ event })
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

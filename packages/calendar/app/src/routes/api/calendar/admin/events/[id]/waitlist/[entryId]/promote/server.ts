import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import { promoteWaitlistedParticipant } from '@calendar/core'
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

		const { db } = await getAdminAuth({ event })
		const result = await promoteWaitlistedParticipant(db, { eventId, entryId })
		if (result.status === 'not_found') return apiError('Entry not found', { status: 404 })
		return apiOk({ status: result.status })
	})
}

import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import { promoteWaitlistedParticipant } from '@calendar/core'
import { apiError, apiOk, logApiError } from '@calendar/kit'
import { enforceSameOrigin, requireAdminSession, unauthorized } from '@calendar/app/admin-api-helpers'

function parsePositiveInt(value: string | undefined) {
	if (!value) return null
	const parsed = Number.parseInt(value, 10)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export async function POST(event: RequestEvent) {
	try {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf

		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const eventId = parsePositiveInt(event.params['id'])
		const entryId = parsePositiveInt(event.params['entryId'])
		if (!eventId || !entryId) return apiError('Invalid ids', { status: 400 })

		const { db } = await getAdminAuth({ event })
		const result = await promoteWaitlistedParticipant(db, { eventId, entryId })
		if (result.status === 'not_found') return apiError('Entry not found', { status: 404 })
		return apiOk({ status: result.status })
	} catch (err) {
		logApiError('admin.events.waitlist.promote', err)
		return apiError('Internal server error')
	}
}

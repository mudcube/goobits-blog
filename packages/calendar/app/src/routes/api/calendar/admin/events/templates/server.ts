import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import { listEventTemplates } from '@calendar/core'
import { apiError, apiOk, logApiError } from '@calendar/kit'
import { requireAdminSession, unauthorized } from '@calendar/app/admin-api-helpers'

export async function GET(event: RequestEvent) {
	try {
		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const { db } = await getAdminAuth({ event })
		const templates = await listEventTemplates(db)
		return apiOk({ templates })
	} catch (err) {
		logApiError('admin.events.templates.get', err)
		return apiError('Internal server error')
	}
}

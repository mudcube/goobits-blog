import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { listEventTemplates } from '@calendar/core'
import { apiOk } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.events.templates.get', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const { DB: db } = await buildEnv(event.platform)
		const templates = await listEventTemplates(db)
		return apiOk({ templates })
	})
}

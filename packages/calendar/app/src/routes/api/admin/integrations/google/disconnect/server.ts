import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { deleteConnection, requireEnv } from '@calendar/core'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk } from '@calendar/kit'

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.integrations.google.disconnect', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const env = await buildEnv(event.platform)
		// Keep env validation consistent with connection encryption lifecycle.
		requireEnv(env, 'TOKEN_ENC_KEY')
		await deleteConnection({ db: env.DB, provider: 'google' })
		logAdminEvent(event, 'integration_disconnect', { provider: 'google' })
		return apiOk({})
	})
}

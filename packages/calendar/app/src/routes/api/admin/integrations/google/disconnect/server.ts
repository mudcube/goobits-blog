import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { deleteConnection, requireEnv } from '@calendar/core'
import { enforceSameOrigin, logAdminEvent, requireAdminSession, unauthorized } from '@calendar/app/admin-api-helpers'
import { apiError, apiOk, logApiError } from '@calendar/kit'

export async function POST(event: RequestEvent) {
	try {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf

		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const env = await buildEnv(event.platform)
		// Keep env validation consistent with connection encryption lifecycle.
		requireEnv(env, 'TOKEN_ENC_KEY')
		await deleteConnection({ db: env.DB, provider: 'google' })
		logAdminEvent(event, 'integration_disconnect', { provider: 'google' })
		return apiOk({})
	} catch (error) {
		logApiError('admin.integrations.google.disconnect', error)
		return apiError('Internal server error')
	}
}

import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { createOauthState, getGoogleAuthUrl } from '@calendar/core'
import { enforceSameOrigin, requireAdminSession, unauthorized } from '@calendar/app/admin-api-helpers'
import { apiError, apiOk, logApiError } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	try {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf

		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const env = await buildEnv(event.platform)
		const state = crypto.randomUUID()
		await createOauthState({ db: env.DB, state })
		const authUrl = getGoogleAuthUrl({ env, state })

		return apiOk({ authUrl })
	} catch (err) {
		logApiError('calendar.oauth.start', err)
		return apiError('Failed to start OAuth')
	}
}

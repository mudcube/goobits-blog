import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { createOauthState, getGoogleAuthUrl } from '@calendar/core'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runApiRequest('calendar.oauth.start', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const env = await buildEnv(event.platform)
		const state = crypto.randomUUID()
		await createOauthState({ db: env.DB, state })
		const authUrl = getGoogleAuthUrl({ env, state })

		return apiOk({ authUrl })
	}, { internalErrorMessage: 'Failed to start OAuth' })
}

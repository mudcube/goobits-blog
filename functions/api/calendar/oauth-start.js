import { createOauthState, getGoogleAuthUrl } from '../../../packages/calendar/src/index.js'
import { errorResponse, jsonResponse, requireAdmin } from './_helpers.js'

export async function onRequest({ env, request }) {
	try {
		if (!await requireAdmin({ env, request })) {
			return errorResponse('Unauthorized', 401, 'unauthorized')
		}

		const state = crypto.randomUUID()
		await createOauthState({ db: env.DB, state })
		const authUrl = getGoogleAuthUrl({ env, state })

		return jsonResponse({
			authUrl,
			state
		})
	} catch (err) {
		return errorResponse(err?.message || 'Failed to start OAuth', 500, 'oauth_start_error')
	}
}

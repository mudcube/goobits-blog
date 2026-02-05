import { createOauthState, getGoogleAuthUrl } from '../../../packages/calendar/src/index.ts'
import { type EnvLike, enforceSameOriginRequest, errorResponse, jsonResponse, requireAdmin } from './_helpers.ts'

export async function onRequest({ env, request }: { env: EnvLike; request: Request }) {
	try {
		const csrf = enforceSameOriginRequest(request)
		if (csrf) return csrf

		if (!await requireAdmin({ env, request })) {
			return errorResponse('Unauthorized', 401, 'unauthorized')
		}

		const state = crypto.randomUUID()
		await createOauthState({ db: env.DB, state })
		const authUrl = getGoogleAuthUrl({ env, state })

		return jsonResponse({
			authUrl
		})
	} catch (err) {
		console.error('OAuth start error:', err)
		return errorResponse('Failed to start OAuth', 500, 'oauth_start_error')
	}
}

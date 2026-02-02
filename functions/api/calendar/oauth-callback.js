import { consumeOauthState, exchangeGoogleCode, saveConnection } from '../../../packages/calendar/src/index.js'
import { errorResponse, getTokenKey } from './_helpers.js'

export async function onRequest({ env, request }) {
	try {
		const url = new URL(request.url)
		const code = url.searchParams.get('code')
		const state = url.searchParams.get('state')
		if (!code) return errorResponse('Missing code', 400, 'missing_code')
		if (!state) return errorResponse('Missing state', 400, 'invalid_state')

		const validState = await consumeOauthState({ db: env.DB, state })
		if (!validState) return errorResponse('Invalid state', 400, 'invalid_state')

		const token = await exchangeGoogleCode({ env, code })
		await saveConnection({
			db: env.DB,
			provider: 'google',
			token,
			base64Key: getTokenKey(env)
		})

		return Response.redirect(new URL('/admin/calendar?connected=1', request.url), 302)
	} catch (err) {
		return errorResponse(err?.message || 'OAuth callback failed', 500, 'oauth_callback_error')
	}
}

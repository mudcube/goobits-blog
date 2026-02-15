import { consumeOauthState, exchangeGoogleCode, saveConnection } from '../../../packages/calendar/src/index.ts'
import { type EnvLike, errorResponse, getTokenKey } from './_helpers.ts'

export async function onRequest({ env, request }: { env: EnvLike; request: Request }) {
	try {
		const url = new URL(request.url)
		const code = url.searchParams.get('code')
		const state = url.searchParams.get('state')
		if (!code) return errorResponse('Missing code', 400, 'missing_code')
		if (!state) return errorResponse('Missing state', 400, 'invalid_state')

		const authCallback = new URL('/auth/google/callback', request.url)
		authCallback.search = url.search

		// Member sign-in state is cookie-based and not stored in DB.
		// Admin connect flow uses UUID state persisted in oauth_states.
		const isAdminOauthState = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(state)
		if (!isAdminOauthState) {
			return Response.redirect(authCallback, 302)
		}

		const validState = await consumeOauthState({ db: env.DB, state })
		if (!validState) {
			// Backward-compat: if this callback was used by the member auth flow,
			// hand off to the Goobits provider callback route which validates cookie state.
			return Response.redirect(authCallback, 302)
		}

		const token = await exchangeGoogleCode({ env, code })
		await saveConnection({
			db: env.DB,
			provider: 'google',
			token,
			base64Key: getTokenKey(env)
		})

		return Response.redirect(new URL('/admin?connected=1', request.url), 302)
	} catch (err) {
		console.error('OAuth callback error:', err)
		return errorResponse('OAuth callback failed', 500, 'oauth_callback_error')
	}
}

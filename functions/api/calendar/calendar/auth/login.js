import {
	errorResponse,
	jsonResponse,
	readJson,
	generateState,
	PROVIDERS,
	buildGoogleAuthUrl,
	buildAppleAuthUrl,
	createCalendarOauthState
} from '../_helpers.js'

export async function onRequest({ env, request }) {
	if (request.method !== 'POST') {
		return errorResponse('Method not allowed', 405)
	}

	const body = await readJson(request)
	if (body === null) {
		return errorResponse('Invalid JSON', 400, 'invalid_json')
	}
	const { provider, invite, redirectTo } = body

	if (!provider || !PROVIDERS[provider]) {
		return errorResponse('Invalid provider. Must be "google" or "apple".')
	}

	const state = generateState()

	await createCalendarOauthState({
		db: env.DB,
		state,
		provider,
		inviteCode: invite || null,
		redirectTo: redirectTo || '/calendar'
	})

	let authUrl
	if (provider === 'google') {
		authUrl = buildGoogleAuthUrl({ env, state })
	} else if (provider === 'apple') {
		authUrl = buildAppleAuthUrl({ env, state })
	}

	return jsonResponse({ ok: true, authUrl })
}

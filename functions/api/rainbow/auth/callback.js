import {
	errorResponse,
	getBaseUrl,
	consumeRainbowOauthState,
	exchangeGoogleCode,
	getGoogleUserInfo,
	exchangeAppleCode,
	parseAppleIdToken,
	createRainbowUser,
	validateInvite,
	consumeInvite,
	hasUserRedeemedAnyInvite,
	createSession,
	getSessionCookie
} from '../_helpers.js'

export async function onRequest({ env, request }) {
	const url = new URL(request.url)
	const baseUrl = getBaseUrl(env)

	// Handle both GET (Google) and POST (Apple form_post)
	let code, state, appleUser
	if (request.method === 'POST') {
		const formData = await request.formData()
		code = formData.get('code')
		state = formData.get('state')
		const userJson = formData.get('user')
		if (userJson) {
			try {
				appleUser = JSON.parse(userJson)
			} catch {}
		}
	} else {
		code = url.searchParams.get('code')
		state = url.searchParams.get('state')
	}

	if (!code || !state) {
		return redirectWithError(baseUrl, 'Missing code or state')
	}

	const stateData = await consumeRainbowOauthState({ db: env.DB, state })
	if (!stateData) {
		return redirectWithError(baseUrl, 'Invalid or expired state')
	}

	const { provider, inviteCode, redirectTo } = stateData

	let userInfo
	try {
		if (provider === 'google') {
			const tokens = await exchangeGoogleCode({ env, code })
			userInfo = await getGoogleUserInfo(tokens.access_token)
		} else if (provider === 'apple') {
			const result = await exchangeAppleCode({ env, code })
			userInfo = result.user
			// Apple only sends name on first auth, grab from user payload
			if (appleUser?.name) {
				userInfo.name = [appleUser.name.firstName, appleUser.name.lastName].filter(Boolean).join(' ')
			}
		}
	} catch (err) {
		console.error('OAuth exchange failed:', err)
		return redirectWithError(baseUrl, 'OAuth authentication failed')
	}

	// Create or update user
	const user = await createRainbowUser({
		db: env.DB,
		provider,
		providerId: userInfo.providerId,
		email: userInfo.email,
		name: userInfo.name,
		avatarUrl: userInfo.avatarUrl
	})

	// Check if user needs an invite (first-time users only)
	const hasRedeemedBefore = await hasUserRedeemedAnyInvite({ db: env.DB, userId: user.id })

	if (!hasRedeemedBefore) {
		// New user needs a valid invite
		if (!inviteCode) {
			return redirectWithError(baseUrl, 'Invite code required for new users')
		}

		const inviteResult = await validateInvite({ db: env.DB, code: inviteCode, email: userInfo.email })
		if (!inviteResult.valid) {
			return redirectWithError(baseUrl, `Invalid invite: ${inviteResult.reason}`)
		}

		await consumeInvite({ db: env.DB, inviteId: inviteResult.invite.id, userId: user.id })
	}

	// Create session
	const { sessionId, expiresAt } = await createSession({ db: env.DB, userId: user.id })
	const secure = env.NODE_ENV !== 'development'
	const cookie = getSessionCookie(sessionId, expiresAt, { secure })

	return new Response(null, {
		status: 302,
		headers: {
			Location: redirectTo || '/rainbow',
			'Set-Cookie': cookie
		}
	})
}

function redirectWithError(baseUrl, message) {
	const params = new URLSearchParams({ error: message })
	return new Response(null, {
		status: 302,
		headers: {
			Location: `${baseUrl}/rainbow/login?${params.toString()}`
		}
	})
}

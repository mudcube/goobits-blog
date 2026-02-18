const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export function buildAuthUrl({
	clientId,
	redirectUri,
	scopes,
	state
}: {
	clientId: string
	redirectUri: string
	scopes: string[]
	state: string
}) {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		access_type: 'offline',
		prompt: 'consent',
		scope: scopes.join(' '),
		include_granted_scopes: 'true',
		state
	})
	return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForTokens({
	clientId,
	clientSecret,
	redirectUri,
	code
}: {
	clientId: string
	clientSecret: string
	redirectUri: string
	code: string
}) {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri,
		code,
		grant_type: 'authorization_code'
	})

	const res = await fetch(GOOGLE_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Google token exchange failed: ${res.status} ${errText}`)
	}

	return res.json()
}

export async function refreshAccessToken({
	clientId,
	clientSecret,
	refreshToken
}: {
	clientId: string
	clientSecret: string
	refreshToken: string
}) {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: refreshToken,
		grant_type: 'refresh_token'
	})

	const res = await fetch(GOOGLE_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Google token refresh failed: ${res.status} ${errText}`)
	}

	return res.json()
}

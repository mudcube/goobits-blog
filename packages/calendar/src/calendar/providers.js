const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize'
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'

export const PROVIDERS = {
	google: {
		name: 'Google',
		scopes: ['openid', 'email', 'profile']
	},
	apple: {
		name: 'Apple',
		scopes: ['name', 'email']
	}
}

function getAuthRedirectUri(env) {
	if (env.CALENDAR_AUTH_REDIRECT_URI) return env.CALENDAR_AUTH_REDIRECT_URI
	const base = env.PUBLIC_BASE_URL || env.BASE_URL || ''
	return `${base}/api/calendar/auth/callback`
}

export function getGoogleConfig(env) {
	return {
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
		redirectUri: getAuthRedirectUri(env)
	}
}

export function getAppleConfig(env) {
	return {
		clientId: env.APPLE_CLIENT_ID,
		teamId: env.APPLE_TEAM_ID,
		keyId: env.APPLE_KEY_ID,
		privateKey: env.APPLE_PRIVATE_KEY,
		redirectUri: getAuthRedirectUri(env)
	}
}

export function buildGoogleAuthUrl({ env, state }) {
	const { clientId, redirectUri } = getGoogleConfig(env)
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: PROVIDERS.google.scopes.join(' '),
		state
	})
	return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export function buildAppleAuthUrl({ env, state }) {
	const { clientId, redirectUri } = getAppleConfig(env)
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: PROVIDERS.apple.scopes.join(' '),
		response_mode: 'form_post',
		state
	})
	return `${APPLE_AUTH_URL}?${params.toString()}`
}

export async function exchangeGoogleCode({ env, code }) {
	const { clientId, clientSecret, redirectUri } = getGoogleConfig(env)
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

export async function getGoogleUserInfo(accessToken) {
	const res = await fetch(GOOGLE_USERINFO_URL, {
		headers: { Authorization: `Bearer ${accessToken}` }
	})

	if (!res.ok) {
		throw new Error(`Failed to get Google user info: ${res.status}`)
	}

	const data = await res.json()
	return {
		providerId: data.id,
		email: data.email,
		name: data.name,
		avatarUrl: data.picture
	}
}

async function generateAppleClientSecret({ teamId, clientId, keyId, privateKey }) {
	const header = { alg: 'ES256', kid: keyId }
	const now = Math.floor(Date.now() / 1000)
	const payload = {
		iss: teamId,
		iat: now,
		exp: now + 86400 * 180, // 180 days
		aud: 'https://appleid.apple.com',
		sub: clientId
	}

	const encoder = new TextEncoder()
	const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
	const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
	const toSign = `${headerB64}.${payloadB64}`

	// Import PEM private key
	const pemContents = privateKey
		.replace(/-----BEGIN PRIVATE KEY-----/g, '')
		.replace(/-----END PRIVATE KEY-----/g, '')
		.replace(/\s/g, '')
	const keyBytes = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

	const cryptoKey = await crypto.subtle.importKey(
		'pkcs8',
		keyBytes,
		{ name: 'ECDSA', namedCurve: 'P-256' },
		false,
		['sign']
	)

	const signature = await crypto.subtle.sign(
		{ name: 'ECDSA', hash: 'SHA-256' },
		cryptoKey,
		encoder.encode(toSign)
	)

	const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
		.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

	return `${toSign}.${sigB64}`
}

export async function exchangeAppleCode({ env, code }) {
	const config = getAppleConfig(env)
	const clientSecret = await generateAppleClientSecret(config)

	const body = new URLSearchParams({
		client_id: config.clientId,
		client_secret: clientSecret,
		redirect_uri: config.redirectUri,
		code,
		grant_type: 'authorization_code'
	})

	const res = await fetch(APPLE_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Apple token exchange failed: ${res.status} ${errText}`)
	}

	return res.json()
}

export function parseAppleIdToken(idToken) {
	const [, payloadB64] = idToken.split('.')
	const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
	return {
		providerId: payload.sub,
		email: payload.email,
		name: null, // Apple only sends name on first auth
		avatarUrl: null
	}
}

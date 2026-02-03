const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize'
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'

export function buildAuthUrl({ clientId, redirectUri, scopes, state }) {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: scopes.join(' '),
		response_mode: 'form_post',
		state
	})
	return `${APPLE_AUTH_URL}?${params.toString()}`
}

async function generateClientSecret({ teamId, clientId, keyId, privateKey }) {
	const header = { alg: 'ES256', kid: keyId }
	const now = Math.floor(Date.now() / 1000)
	const payload = {
		iss: teamId,
		iat: now,
		exp: now + 86400 * 180,
		aud: 'https://appleid.apple.com',
		sub: clientId
	}

	const encoder = new TextEncoder()
	const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
	const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
	const toSign = `${headerB64}.${payloadB64}`

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

export async function exchangeCodeForTokens({ clientId, teamId, keyId, privateKey, redirectUri, code }) {
	const clientSecret = await generateClientSecret({ teamId, clientId, keyId, privateKey })

	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri,
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

export function parseIdToken(idToken) {
	const [, payloadB64] = idToken.split('.')
	const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
	return {
		sub: payload.sub,
		email: payload.email,
		emailVerified: payload.email_verified
	}
}

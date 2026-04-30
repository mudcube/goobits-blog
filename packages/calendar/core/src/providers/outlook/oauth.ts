const MICROSOFT_AUTH_BASE = 'https://login.microsoftonline.com'
const MICROSOFT_TOKEN_PATH = '/oauth2/v2.0/token'

export type OutlookTokenResponse = {
	access_token: string
	refresh_token?: string
	expires_in?: number
	scope?: string
	token_type?: string
}

export type NormalizedOutlookToken = {
	accessToken: string
	refreshToken: string
	expiresAt: number | null
	scope: string | null
	tokenType?: string
}

export function isOutlookTokenExpired(token: { expiresAt?: number | null } | null | undefined) {
	if (!token?.expiresAt) return true
	return Date.now() >= token.expiresAt - 60_000
}

export function normalizeOutlookTokenResponse(
	tokenResponse: OutlookTokenResponse,
	refreshTokenFallback?: string | null
): NormalizedOutlookToken {
	const expiresAt = Date.now() + (tokenResponse.expires_in ?? 0) * 1000
	return {
		accessToken: tokenResponse.access_token,
		refreshToken: tokenResponse.refresh_token ?? refreshTokenFallback ?? '',
		expiresAt,
		scope: tokenResponse.scope ?? null,
		...(tokenResponse.token_type ? { tokenType: tokenResponse.token_type } : {})
	}
}

export function buildOutlookAuthUrl({
	tenant,
	clientId,
	redirectUri,
	scopes,
	state
}: {
	tenant: string
	clientId: string
	redirectUri: string
	scopes: string[]
	state: string
}) {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		response_mode: 'query',
		scope: scopes.join(' '),
		state
	})
	return `${MICROSOFT_AUTH_BASE}/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize?${params.toString()}`
}

export async function exchangeOutlookCodeForTokens({
	tenant,
	clientId,
	clientSecret,
	redirectUri,
	code,
	scopes
}: {
	tenant: string
	clientId: string
	clientSecret: string
	redirectUri: string
	code: string
	scopes: string[]
}) {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri,
		code,
		grant_type: 'authorization_code',
		scope: scopes.join(' ')
	})

	const res = await fetch(`${MICROSOFT_AUTH_BASE}/${encodeURIComponent(tenant)}${MICROSOFT_TOKEN_PATH}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Outlook token exchange failed: ${res.status} ${errText}`)
	}

	return normalizeOutlookTokenResponse(await res.json())
}

export async function refreshOutlookAccessToken({
	tenant,
	clientId,
	clientSecret,
	refreshToken,
	scopes
}: {
	tenant: string
	clientId: string
	clientSecret: string
	refreshToken: string
	scopes: string[]
}) {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: refreshToken,
		grant_type: 'refresh_token',
		scope: scopes.join(' ')
	})

	const res = await fetch(`${MICROSOFT_AUTH_BASE}/${encodeURIComponent(tenant)}${MICROSOFT_TOKEN_PATH}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Outlook token refresh failed: ${res.status} ${errText}`)
	}

	return normalizeOutlookTokenResponse(await res.json(), refreshToken)
}

export type GoogleTokenResponse = {
	access_token: string
	refresh_token?: string
	expires_in?: number
	scope?: string
	token_type?: string
}

export type NormalizedGoogleToken = {
	accessToken: string
	refreshToken: string
	expiresAt: number | null
	scope: string | null
	tokenType?: string
}

export function isTokenExpired(token: { expiresAt?: number | null } | null | undefined) {
	if (!token?.expiresAt) return true
	return Date.now() >= token.expiresAt - 60_000
}

export function normalizeTokenResponse(
	tokenResponse: GoogleTokenResponse,
	refreshTokenFallback?: string | null
): NormalizedGoogleToken {
	const expiresAt = Date.now() + (tokenResponse.expires_in ?? 0) * 1000
	return {
		accessToken: tokenResponse.access_token,
		refreshToken: tokenResponse.refresh_token ?? refreshTokenFallback ?? '',
		expiresAt,
		scope: tokenResponse.scope ?? null,
		...(tokenResponse.token_type ? { tokenType: tokenResponse.token_type } : {})
	}
}

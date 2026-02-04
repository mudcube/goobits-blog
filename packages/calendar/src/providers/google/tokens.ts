export function isTokenExpired(token: { expiresAt?: number } | null | undefined) {
	if (!token?.expiresAt) return true
	return Date.now() >= token.expiresAt - 60_000
}

export function normalizeTokenResponse(
	tokenResponse: any,
	refreshTokenFallback?: string | null
) {
	const expiresAt = Date.now() + (tokenResponse.expires_in ?? 0) * 1000
	return {
		accessToken: tokenResponse.access_token,
		refreshToken: tokenResponse.refresh_token ?? refreshTokenFallback,
		expiresAt,
		scope: tokenResponse.scope,
		tokenType: tokenResponse.token_type
	}
}

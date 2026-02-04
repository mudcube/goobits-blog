import { buildAuthUrl, exchangeCodeForTokens, parseIdToken } from './oauth.js'

const DEFAULT_SCOPES = ['name', 'email']

export function getAppleConfig(env) {
	return {
		clientId: env.APPLE_CLIENT_ID,
		teamId: env.APPLE_TEAM_ID,
		keyId: env.APPLE_KEY_ID,
		privateKey: env.APPLE_PRIVATE_KEY,
		redirectUri: `${env.PUBLIC_BASE_URL || env.BASE_URL}/api/calendar/auth/callback`
	}
}

export function getAppleAuthUrl({ env, state, scopes = DEFAULT_SCOPES }) {
	const { clientId, redirectUri } = getAppleConfig(env)
	return buildAuthUrl({ clientId, redirectUri, scopes, state })
}

export async function exchangeAppleCode({ env, code }) {
	const config = getAppleConfig(env)
	const tokenResponse = await exchangeCodeForTokens({
		clientId: config.clientId,
		teamId: config.teamId,
		keyId: config.keyId,
		privateKey: config.privateKey,
		redirectUri: config.redirectUri,
		code
	})

	const userInfo = parseIdToken(tokenResponse.id_token)

	return {
		accessToken: tokenResponse.access_token,
		refreshToken: tokenResponse.refresh_token,
		expiresIn: tokenResponse.expires_in,
		user: {
			providerId: userInfo.sub,
			email: userInfo.email,
			name: null,
			avatarUrl: null
		}
	}
}

export { DEFAULT_SCOPES }

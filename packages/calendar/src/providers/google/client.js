import { requireEnv } from '../../config/env.js'

export function getGoogleConfig(env) {
	return {
		clientId: requireEnv(env, 'GOOGLE_CLIENT_ID'),
		clientSecret: requireEnv(env, 'GOOGLE_CLIENT_SECRET'),
		redirectUri: requireEnv(env, 'GOOGLE_REDIRECT_URI')
	}
}

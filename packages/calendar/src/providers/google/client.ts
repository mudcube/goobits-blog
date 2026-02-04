import { requireEnv } from '../../config/env.ts'

export function getGoogleConfig(env: Record<string, any>) {
	return {
		clientId: requireEnv(env, 'GOOGLE_CLIENT_ID'),
		clientSecret: requireEnv(env, 'GOOGLE_CLIENT_SECRET'),
		redirectUri: requireEnv(env, 'GOOGLE_REDIRECT_URI')
	}
}

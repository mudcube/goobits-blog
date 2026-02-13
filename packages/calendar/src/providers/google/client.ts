import { requireEnv } from '../../config/env.ts'

type GoogleEnv = Record<string, unknown> | null | undefined

export function getGoogleConfig(env: GoogleEnv) {
	return {
		clientId: requireEnv(env, 'GOOGLE_CLIENT_ID'),
		clientSecret: requireEnv(env, 'GOOGLE_CLIENT_SECRET'),
		redirectUri: requireEnv(env, 'GOOGLE_REDIRECT_URI')
	}
}

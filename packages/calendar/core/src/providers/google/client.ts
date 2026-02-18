import { requireEnv } from '../../config/env.ts'

type GoogleEnv = Record<string, unknown> | null | undefined

export function getGoogleConfig(env: GoogleEnv) {
	const redirectUriRaw = requireEnv(env, 'GOOGLE_REDIRECT_URI')
	return {
		clientId: requireEnv(env, 'GOOGLE_CLIENT_ID'),
		clientSecret: requireEnv(env, 'GOOGLE_CLIENT_SECRET'),
		// Google OAuth requires exact redirect URI matching. Normalize common foot-guns.
		redirectUri: redirectUriRaw.endsWith('/') ? redirectUriRaw.slice(0, -1) : redirectUriRaw
	}
}

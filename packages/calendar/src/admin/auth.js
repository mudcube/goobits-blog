import { CredentialsProvider } from '@goobits/auth/providers'
import { D1SessionAdapter, D1UserAdapter } from '@goobits/auth/adapters'
import { hashPassword } from '@goobits/auth/utils'

export const ADMIN_EMAIL = 'admin@miko.art'
export const ADMIN_COOKIE_NAME = 'admin_session'

export function createAdminAdapters({ db, secureCookies = true, sessionLifetimeMs = 60 * 24 * 60 * 60 * 1000 } = {}) {
	const userAdapter = new D1UserAdapter(db, {
		usersTable: 'admin_users',
		columns: {
			id: 'id',
			email: 'email',
			name: 'name',
			avatar: 'avatar_url',
			emailVerified: 'email_verified',
			password: 'password'
		}
	})

	const sessionAdapter = new D1SessionAdapter(db, {
		sessionsTable: 'admin_sessions',
		usersTable: 'admin_users',
		cookieName: ADMIN_COOKIE_NAME,
		secureCookies,
		sessionLifetime: sessionLifetimeMs
	})

	const credentialsProvider = new CredentialsProvider()

	return { userAdapter, sessionAdapter, credentialsProvider }
}

export async function ensureAdminUser({ userAdapter, passcode }) {
	const existing = await userAdapter.getUserByEmail(ADMIN_EMAIL)
	if (existing) return existing
	const password = await hashPassword(passcode)
	return userAdapter.createUser({
		email: ADMIN_EMAIL,
		name: 'Admin',
		verified_email: true
	}, { password })
}

export function parseCookieHeader(cookieHeader, cookieName) {
	if (!cookieHeader) return null
	const cookies = Object.fromEntries(
		cookieHeader.split(';').map(chunk => {
			const [key, ...rest] = chunk.trim().split('=')
			return [key, rest.join('=')]
		})
	)
	return cookies[cookieName] || null
}

export async function validateAdminSessionFromHeader({ db, cookieHeader, secureCookies = true }) {
	const { sessionAdapter } = createAdminAdapters({ db, secureCookies })
	const token = parseCookieHeader(cookieHeader, sessionAdapter.cookieName)
	if (!token) return { ok: false }
	const { session, user } = await sessionAdapter.validateSession(token)
	return { ok: !!session, session, user, sessionAdapter }
}

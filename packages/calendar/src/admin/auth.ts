import { CredentialsProvider } from '@goobits/auth/providers'
import { D1SessionAdapter, D1UserAdapter } from '@goobits/auth/adapters'
import { hashPassword } from '@goobits/auth/utils'
import type { D1DatabaseLike } from '../storage/d1.ts'

export const ADMIN_EMAIL = 'admin@miko.art'
export const ADMIN_COOKIE_NAME = 'admin_session'

type AdminUser = { id: string | number; email: string; name?: string | null }
type AdminUserAdapterLike = {
	getUserByEmail: (email: string) => Promise<AdminUser | null>
	updateUser?: (id: string, data: Record<string, unknown>) => Promise<AdminUser>
	createUser: (
		profile: { email: string; name: string; verified_email: boolean },
		metadata: { password: string }
	) => Promise<AdminUser>
}

export function createAdminAdapters({
	db,
	secureCookies = true,
	sessionLifetimeMs = 60 * 24 * 60 * 60 * 1000
}: {
	db?: D1DatabaseLike
	secureCookies?: boolean
	sessionLifetimeMs?: number
} = {}) {
	if (!db) {
		throw new Error('createAdminAdapters requires db')
	}
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

export async function ensureAdminUser({
	userAdapter,
	passcode
}: {
	userAdapter: AdminUserAdapterLike
	passcode: string
}) {
	const existing = await userAdapter.getUserByEmail(ADMIN_EMAIL)
	const password = await hashPassword(passcode)
	if (existing) {
		// Keep the configured env passcode authoritative in case it changed.
		if (userAdapter.updateUser) {
			await userAdapter.updateUser(String(existing.id), { password })
		}
		return existing
	}
	return userAdapter.createUser({
		email: ADMIN_EMAIL,
		name: 'Admin',
		verified_email: true
	}, { password })
}

export function parseCookieHeader(cookieHeader: string | null, cookieName: string) {
	if (!cookieHeader) return null
	const cookies = Object.fromEntries(
		cookieHeader.split(';').map(chunk => {
			const [key, ...rest] = chunk.trim().split('=')
			return [key, rest.join('=')]
		})
	)
	return cookies[cookieName] || null
}

export async function validateAdminSessionFromHeader({
	db,
	cookieHeader,
	secureCookies = true
}: {
	db: D1DatabaseLike
	cookieHeader: string | null
	secureCookies?: boolean
}) {
	const { sessionAdapter } = createAdminAdapters({ db, secureCookies })
	const token = parseCookieHeader(cookieHeader, ADMIN_COOKIE_NAME)
	if (!token) return { ok: false }
	const { session, user } = await sessionAdapter.validateSession(token)
	return { ok: !!session, session, user, sessionAdapter }
}

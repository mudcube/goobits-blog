import { D1SessionAdapter } from '@goobits/auth/adapters'
import type { Cookies } from '@sveltejs/kit'
import type { D1DatabaseLike } from '@calendar/kit'

type CalendarUserRow = { id: string | number }

export function createCalendarSessionAdapter(db: D1DatabaseLike, secureCookies: boolean) {
	return new D1SessionAdapter(db, {
		sessionsTable: 'calendar_sessions',
		usersTable: 'calendar_users',
		cookieName: 'calendar_session',
		secureCookies,
		sessionLifetime: 7 * 24 * 60 * 60 * 1000,
		userColumns: {
			id: 'id',
			email: 'email',
			name: 'name',
			avatar: 'avatar_url',
			password: 'password',
			emailVerified: 'email_verified'
		}
	})
}

export async function ensureCalendarUserByEmail({
	db,
	email,
	name,
	emailVerified,
	rejectIfExists = false
}: {
	db: D1DatabaseLike
	email: string
	name: string
	emailVerified: boolean
	rejectIfExists?: boolean
}) {
	const existing = await db.prepare(
		`SELECT id FROM calendar_users WHERE lower(email) = lower(?) LIMIT 1`
	).bind(email).first<CalendarUserRow>()

	if (existing?.id) {
		if (rejectIfExists) return { ok: false as const, reason: 'exists' as const }

		await db.prepare(
			`UPDATE calendar_users SET last_login_at = unixepoch() WHERE id = ?`
		).bind(existing.id).run()
		return { ok: true as const, userId: existing.id, created: false as const }
	}

	const inserted = await db.prepare(
		`INSERT INTO calendar_users (email, name, email_verified, created_at, last_login_at)
		 VALUES (?, ?, ?, unixepoch(), unixepoch())`
	).bind(email, name, emailVerified ? 1 : 0).run()

	return { ok: true as const, userId: inserted.meta.last_row_id, created: true as const }
}

export async function setCalendarSessionCookie({
	db,
	cookies,
	secureCookies,
	userId
}: {
	db: D1DatabaseLike
	cookies: Cookies
	secureCookies: boolean
	userId: string
}) {
	const sessionAdapter = createCalendarSessionAdapter(db, secureCookies)
	const session = await sessionAdapter.createSession(userId)
	sessionAdapter.setSessionCookie(cookies, session)
	return session
}

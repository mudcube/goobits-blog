import type { Cookies } from '@sveltejs/kit'
import { createCalendarSessionAdapter, type D1DatabaseLike } from '@calendar/kit'

type CalendarUserRow = { id: string | number }

async function seedCalendarUserProgramAccess(db: D1DatabaseLike, userId: string | number) {
	await db.prepare(
		`INSERT OR IGNORE INTO calendar_user_program_access (user_id, program_slug, allowed, updated_at)
		 SELECT ?, slug, 1, unixepoch()
		 FROM calendar_programs
		 WHERE enabled = 1`
	).bind(userId).run()
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
			await seedCalendarUserProgramAccess(db, existing.id)
			return { ok: true as const, userId: existing.id, created: false as const }
		}

	const inserted = await db.prepare(
		`INSERT INTO calendar_users (email, name, email_verified, created_at, last_login_at)
		 VALUES (?, ?, ?, unixepoch(), unixepoch())`
	).bind(email, name, emailVerified ? 1 : 0).run()

	await seedCalendarUserProgramAccess(db, inserted.meta.last_row_id)

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

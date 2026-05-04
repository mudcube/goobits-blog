import type { D1DatabaseLike } from '../storage/d1.ts'

type AdminUserRow = {
	id: string | number
	email: string
	name?: string | null
	avatar_url?: string | null
	email_verified?: number | boolean | null
}

export async function isCalendarAdmin({
	db,
	userId
}: {
	db: D1DatabaseLike
	userId: string | number | null | undefined
}) {
	if (userId === null || userId === undefined || userId === '') return false
	const row = await db
		.prepare('SELECT user_id FROM calendar_admins WHERE user_id = ? LIMIT 1')
		.bind(userId)
		.first<{ user_id: string | number }>()
	return !!row
}

export async function grantCalendarAdmin({
	db,
	userId,
	grantedBy
}: {
	db: D1DatabaseLike
	userId: string | number
	grantedBy?: string | number | null | undefined
}) {
	await db
		.prepare(
			`INSERT INTO calendar_admins (user_id, granted_by, granted_at)
			 VALUES (?, ?, unixepoch())
			 ON CONFLICT(user_id) DO UPDATE SET
				granted_by = excluded.granted_by,
				granted_at = excluded.granted_at`
		)
		.bind(userId, grantedBy ?? null)
		.run()
}

export async function getCalendarUserByEmail({
	db,
	email
}: {
	db: D1DatabaseLike
	email: string
}) {
	const normalizedEmail = email.trim().toLowerCase()
	if (!normalizedEmail) return null
	return db
		.prepare(
			`SELECT id, email, name, avatar_url, email_verified
			 FROM calendar_users
			 WHERE lower(email) = lower(?)
			 LIMIT 1`
		)
		.bind(normalizedEmail)
		.first<AdminUserRow>()
}

export async function grantCalendarAdminByEmail({
	db,
	email,
	grantedBy
}: {
	db: D1DatabaseLike
	email: string
	grantedBy?: string | number | null | undefined
}) {
	const user = await getCalendarUserByEmail({ db, email })
	if (!user) return { ok: false as const, reason: 'user_not_found' as const }
	await grantCalendarAdmin({ db, userId: user.id, grantedBy })
	return { ok: true as const, user }
}

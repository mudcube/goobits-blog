import type { D1DatabaseLike } from '../storage/d1.ts'

export type CalendarUserProgramAccess = {
	programSlug: string
	allowed: boolean
}

export async function listUserProgramAccess(
	db: D1DatabaseLike,
	userId: string,
	options: { seedIfMissing?: boolean } = {}
): Promise<CalendarUserProgramAccess[]> {
	const normalizedUserId = Number.parseInt(String(userId), 10)
	if (!Number.isFinite(normalizedUserId) || normalizedUserId <= 0) return []

	const existing = await db.prepare(
		`SELECT program_slug, allowed
		 FROM calendar_user_program_access
		 WHERE user_id = ?
		 ORDER BY program_slug ASC`
	).bind(normalizedUserId).all<{ program_slug: string; allowed: number }>()

	const rows = existing?.results ?? []
	if (rows.length === 0 && options.seedIfMissing !== false) {
		await db.prepare(
			`INSERT OR IGNORE INTO calendar_user_program_access (user_id, program_slug, allowed, updated_at)
			 SELECT ?, slug, 1, unixepoch()
			 FROM calendar_programs
			 WHERE enabled = 1`
		).bind(normalizedUserId).run()

		const seeded = await db.prepare(
			`SELECT program_slug, allowed
			 FROM calendar_user_program_access
			 WHERE user_id = ?
			 ORDER BY program_slug ASC`
		).bind(normalizedUserId).all<{ program_slug: string; allowed: number }>()

		return (seeded?.results ?? []).map((row) => ({
			programSlug: row.program_slug,
			allowed: row.allowed !== 0
		}))
	}

	return rows.map((row) => ({
		programSlug: row.program_slug,
		allowed: row.allowed !== 0
	}))
}

export async function setUserProgramAccess(
	db: D1DatabaseLike,
	userId: string,
	input: Array<{ programSlug: string; allowed: boolean }>
) {
	const normalizedUserId = Number.parseInt(String(userId), 10)
	if (!Number.isFinite(normalizedUserId) || normalizedUserId <= 0) {
		throw new Error('Invalid user id')
	}

	for (const row of input) {
		await db.prepare(
			`INSERT INTO calendar_user_program_access (user_id, program_slug, allowed, updated_at)
			 VALUES (?, ?, ?, unixepoch())
			 ON CONFLICT(user_id, program_slug) DO UPDATE SET
			   allowed = excluded.allowed,
			   updated_at = unixepoch()`
		).bind(normalizedUserId, row.programSlug, row.allowed ? 1 : 0).run()
	}
}

export async function hasUserProgramAccess(
	db: D1DatabaseLike,
	userId: string,
	programSlug: string
): Promise<boolean> {
	const normalizedUserId = Number.parseInt(String(userId), 10)
	if (!Number.isFinite(normalizedUserId) || normalizedUserId <= 0) return false

	const anyRules = await db.prepare(
		`SELECT 1 AS has_rules
		 FROM calendar_user_program_access
		 WHERE user_id = ?
		 LIMIT 1`
	).bind(normalizedUserId).first<{ has_rules: number }>()

	if (!anyRules) return true

	const row = await db.prepare(
		`SELECT allowed
		 FROM calendar_user_program_access
		 WHERE user_id = ? AND program_slug = ?
		 LIMIT 1`
	).bind(normalizedUserId, programSlug).first<{ allowed: number }>()

	return !!row && row.allowed !== 0
}

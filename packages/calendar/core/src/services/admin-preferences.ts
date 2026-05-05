import type { D1DatabaseLike } from '../storage/d1.ts'

export async function getAdminPreference(
	db: D1DatabaseLike,
	userId: number,
	key: string
): Promise<string | null> {
	const row = await db
		.prepare(`SELECT value FROM calendar_admin_preferences WHERE user_id = ? AND key = ? LIMIT 1`)
		.bind(userId, key)
		.first<{ value: string | null }>()
	return row?.value ?? null
}

export async function getAdminPreferences(
	db: D1DatabaseLike,
	userId: number,
	keys: string[]
): Promise<Record<string, string | null>> {
	if (keys.length === 0) return {}
	const placeholders = keys.map(() => '?').join(', ')
	const result = await db
		.prepare(
			`SELECT key, value FROM calendar_admin_preferences WHERE user_id = ? AND key IN (${placeholders})`
		)
		.bind(userId, ...keys)
		.all<{ key: string; value: string | null }>()
	const out: Record<string, string | null> = {}
	for (const key of keys) out[key] = null
	for (const row of result?.results ?? []) {
		out[row.key] = row.value ?? null
	}
	return out
}

export async function setAdminPreference(
	db: D1DatabaseLike,
	userId: number,
	key: string,
	value: string
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO calendar_admin_preferences (user_id, key, value, updated_at)
			 VALUES (?, ?, ?, unixepoch())
			 ON CONFLICT(user_id, key) DO UPDATE SET
			   value = excluded.value,
			   updated_at = unixepoch()`
		)
		.bind(userId, key, value)
		.run()
}

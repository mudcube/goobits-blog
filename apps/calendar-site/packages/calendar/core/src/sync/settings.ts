import type { D1DatabaseLike } from '../storage/d1.ts'

export type CalendarSyncProvider = 'google' | 'outlook' | 'apple'

export function isCalendarSyncProvider(value: unknown): value is CalendarSyncProvider {
	return value === 'google' || value === 'outlook' || value === 'apple'
}

export async function getActiveCalendarSyncProvider(db: D1DatabaseLike): Promise<CalendarSyncProvider | null> {
	try {
		const row = await db
			.prepare(`SELECT value FROM calendar_admin_settings WHERE key = 'sync_provider' LIMIT 1`)
			.first<{ value: string | null }>()
		return isCalendarSyncProvider(row?.value) ? row.value : null
	} catch {
		return null
	}
}

export async function setActiveCalendarSyncProvider(db: D1DatabaseLike, provider: CalendarSyncProvider | null) {
	await db
		.prepare(
			`CREATE TABLE IF NOT EXISTS calendar_admin_settings (
			  key TEXT PRIMARY KEY,
			  value TEXT,
			  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
			)`
		)
		.run()
	await db
		.prepare(
			`INSERT INTO calendar_admin_settings (key, value, updated_at)
			 VALUES ('sync_provider', ?, unixepoch())
			 ON CONFLICT(key) DO UPDATE SET
			   value = excluded.value,
			   updated_at = unixepoch()`
		)
		.bind(provider)
		.run()
}

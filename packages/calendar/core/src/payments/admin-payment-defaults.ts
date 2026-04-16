import type { D1DatabaseLike } from '../storage/d1.ts'

export type AdminPaymentDefaults = {
	provider: string | null
	handle: string | null
}

export async function getAdminPaymentDefaults(db: D1DatabaseLike): Promise<AdminPaymentDefaults> {
	try {
		const rows = await db.prepare(
			`SELECT key, value
			 FROM calendar_admin_settings
			 WHERE key IN ('payment_provider', 'payment_handle')`
		).all<{ key: string; value: string | null }>()

		const map = new Map((rows?.results ?? []).map((row) => [row.key, row.value]))
		return {
			provider: map.get('payment_provider') ?? null,
			handle: map.get('payment_handle') ?? null
		}
	} catch {
		return { provider: null, handle: null }
	}
}

export async function setAdminPaymentDefaults(
	db: D1DatabaseLike,
	input: { provider?: string | null; handle?: string | null }
) {
	await db.prepare(
		`CREATE TABLE IF NOT EXISTS calendar_admin_settings (
		  key TEXT PRIMARY KEY,
		  value TEXT,
		  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		)`
	).run()

	if (Object.prototype.hasOwnProperty.call(input, 'provider')) {
		await db.prepare(
			`INSERT INTO calendar_admin_settings (key, value, updated_at)
			 VALUES ('payment_provider', ?, unixepoch())
			 ON CONFLICT(key) DO UPDATE SET
			   value = excluded.value,
			   updated_at = unixepoch()`
		).bind(input.provider ?? null).run()
	}

	if (Object.prototype.hasOwnProperty.call(input, 'handle')) {
		await db.prepare(
			`INSERT INTO calendar_admin_settings (key, value, updated_at)
			 VALUES ('payment_handle', ?, unixepoch())
			 ON CONFLICT(key) DO UPDATE SET
			   value = excluded.value,
			   updated_at = unixepoch()`
		).bind(input.handle ?? null).run()
	}
}

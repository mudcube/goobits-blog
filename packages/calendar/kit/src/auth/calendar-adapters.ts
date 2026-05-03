import { D1SessionAdapter, D1UserAdapter } from '@goobits/auth/adapters'
import type { RateLimitStore } from '@goobits/auth/security'
import type { D1DatabaseLike } from '../dev/types'

export class CalendarD1RateLimitStore implements RateLimitStore {
	constructor(private db: D1DatabaseLike) {}

	async get(key: string) {
		const row = await this.db
			.prepare(`SELECT count, reset_at FROM rate_limits WHERE key = ? LIMIT 1`)
			.bind(key)
			.first<{ count: number; reset_at: number }>()
		if (!row) return null
		const resetAt = Number(row.reset_at) * 1000
		if (resetAt <= Date.now()) {
			await this.delete(key)
			return null
		}
		return { count: Number(row.count), resetAt }
	}

	async set(key: string, value: { count: number; resetAt: number }) {
		const resetAtSeconds = Math.ceil(value.resetAt / 1000)
		await this.db
			.prepare(
				`INSERT INTO rate_limits (key, count, reset_at) VALUES (?, ?, ?)
				 ON CONFLICT(key) DO UPDATE SET count = excluded.count, reset_at = excluded.reset_at`
			)
			.bind(key, value.count, resetAtSeconds)
			.run()
	}

	async delete(key: string) {
		await this.db.prepare(`DELETE FROM rate_limits WHERE key = ?`).bind(key).run()
	}
}

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

export function createCalendarUserAdapter(db: D1DatabaseLike) {
	return new D1UserAdapter(db, {
		usersTable: 'calendar_users',
		oauthAccountsTable: 'calendar_oauth_accounts',
		columns: {
			id: 'id',
			email: 'email',
			name: 'name',
			avatar: 'avatar_url',
			emailVerified: 'email_verified',
			password: 'password'
		},
		oauthColumns: {
			userId: 'user_id',
			provider: 'provider',
			providerAccountId: 'provider_account_id'
		}
	})
}

export function createCalendarAuthAdapters(db: D1DatabaseLike, secureCookies: boolean) {
	return {
		sessionAdapter: createCalendarSessionAdapter(db, secureCookies),
		userAdapter: createCalendarUserAdapter(db),
		rateLimitStore: new CalendarD1RateLimitStore(db)
	}
}

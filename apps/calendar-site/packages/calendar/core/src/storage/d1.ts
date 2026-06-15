import { decryptString, encryptString } from '../security/crypto.ts'

export type D1PreparedStatement = {
	bind: (...args: unknown[]) => D1PreparedStatement
	first: <T = Record<string, unknown>>() => Promise<T | null>
	all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>
	run: () => Promise<{ meta: { last_row_id: number; changes: number } }>
}

export type D1DatabaseLike = {
	prepare: (sql: string) => D1PreparedStatement
}

/**
 * `connections` rows are dual-named during the credentials migration window:
 *
 *   • Old columns: `access_token` / `refresh_token` — accurate for OAuth
 *     providers (Google/Outlook/Apple) where the stored values really are
 *     access + refresh tokens.
 *   • New columns: `primary_credential` / `secondary_credential` — neutral
 *     names that don't lie about the contents for non-OAuth callers
 *     (PayPal/Square store clientId/clientSecret-shaped values here).
 *
 * Reads coalesce new ?? old so nothing breaks if a row predates the
 * migration backfill. Writes go to BOTH columns during the transition so
 * code that's still running the old read path keeps working. Phase 2
 * (a follow-up migration) drops the old columns once the rollout is
 * verified, after which this file can simplify to single-column reads.
 *
 * The returned object exposes both name pairs so OAuth callers can keep
 * the semantically-meaningful `accessToken/refreshToken` while payment
 * callers use `primaryCredential/secondaryCredential`.
 */
export async function getConnection({
	db,
	provider,
	base64Key
}: {
	db: D1DatabaseLike
	provider: string
	base64Key: string
}) {
	const row = await db.prepare(
		`SELECT provider, access_token, refresh_token, primary_credential, secondary_credential, expires_at, scope FROM connections WHERE provider = ? LIMIT 1`
	).bind(provider).first<{
		provider: string
		access_token: string | null
		refresh_token: string | null
		primary_credential: string | null
		secondary_credential: string | null
		expires_at: number | null
		scope: string | null
	}>()
	if (!row) return null

	const primaryCipher = row.primary_credential ?? row.access_token
	const secondaryCipher = row.secondary_credential ?? row.refresh_token
	if (!primaryCipher || !secondaryCipher) return null

	const primary = await decryptString({ ciphertext: primaryCipher, base64Key })
	const secondary = await decryptString({ ciphertext: secondaryCipher, base64Key })

	return {
		provider: row.provider,
		// OAuth-friendly aliases — the bytes are the same as primary/secondary.
		accessToken: primary,
		refreshToken: secondary,
		// Neutral names — preferred for payment integrations where the
		// values aren't really OAuth tokens.
		primaryCredential: primary,
		secondaryCredential: secondary,
		expiresAt: row.expires_at,
		scope: row.scope
	}
}

export async function saveConnection({
	db,
	provider,
	token,
	base64Key
}: {
	db: D1DatabaseLike
	provider: string
	token: {
		// Accept either name pair; semantic equivalents.
		accessToken?: string
		refreshToken?: string
		primaryCredential?: string
		secondaryCredential?: string
		expiresAt?: number | null
		scope?: string | null
	}
	base64Key: string
}) {
	const primary = token.primaryCredential ?? token.accessToken
	const secondary = token.secondaryCredential ?? token.refreshToken
	if (primary === undefined || secondary === undefined) {
		throw new Error('saveConnection requires either accessToken/refreshToken or primaryCredential/secondaryCredential')
	}
	const encPrimary = await encryptString({ plaintext: primary, base64Key })
	const encSecondary = await encryptString({ plaintext: secondary, base64Key })

	// Dual-write: populate both column pairs during the transition window so
	// rolling back to the pre-Phase-1 codebase remains safe. Phase 2 drops the
	// old columns and this branch collapses to single-column writes.
	await db.prepare(
		`INSERT INTO connections (provider, access_token, refresh_token, primary_credential, secondary_credential, expires_at, scope, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))
		 ON CONFLICT(provider) DO UPDATE SET
		  access_token = excluded.access_token,
		  refresh_token = excluded.refresh_token,
		  primary_credential = excluded.primary_credential,
		  secondary_credential = excluded.secondary_credential,
		  expires_at = excluded.expires_at,
		  scope = excluded.scope,
		  updated_at = strftime('%s','now')`
	)
		.bind(provider, encPrimary, encSecondary, encPrimary, encSecondary, token.expiresAt, token.scope ?? null)
		.run()
}

export async function deleteConnection({
	db,
	provider
}: {
	db: D1DatabaseLike
	provider: string
}) {
	await db.prepare(`DELETE FROM connections WHERE provider = ?`).bind(provider).run()
}

export async function createOauthState({
	db,
	state
}: {
	db: D1DatabaseLike
	state: string
}) {
	await db.prepare(
		`INSERT INTO oauth_states (state, created_at) VALUES (?, strftime('%s','now'))`
	).bind(state).run()
}

export async function consumeOauthState({
	db,
	state,
	maxAgeSeconds = 600
}: {
	db: D1DatabaseLike
	state: string
	maxAgeSeconds?: number
}) {
	const row = await db.prepare(
		`SELECT state, created_at FROM oauth_states WHERE state = ? LIMIT 1`
	).bind(state).first<{ state: string; created_at: number }>()
	if (!row) return false

	const now = Math.floor(Date.now() / 1000)
	if (now - row.created_at > maxAgeSeconds) {
		await db.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()
		return false
	}

	await db.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()
	return true
}

export async function checkRateLimit({
	db,
	key,
	limit = 30,
	windowSeconds = 60
}: {
	db: D1DatabaseLike
	key: string
	limit?: number
	windowSeconds?: number
}) {
	const now = Math.floor(Date.now() / 1000)
	const resetAt = now + windowSeconds

	// Atomic upsert: insert with count=1 if new/expired, otherwise increment
	await db.prepare(
		`INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
		 ON CONFLICT(key) DO UPDATE SET
		   count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
		   reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END`
	).bind(key, resetAt, now, now).run()

	const row = await db.prepare(
		`SELECT count, reset_at FROM rate_limits WHERE key = ? LIMIT 1`
	).bind(key).first<{ count: number; reset_at: number }>()

	if (!row) {
		return { allowed: true, remaining: limit - 1, resetAt }
	}

	const allowed = row.count <= limit
	return { allowed, remaining: Math.max(0, limit - row.count), resetAt: row.reset_at }
}

// Calendar Auth Functions

export async function listCalendarUsers({
	db
}: {
	db: D1DatabaseLike
}) {
	const res = await db.prepare(
		`SELECT u.*, MIN(o.provider) as provider
		 FROM calendar_users u
		 LEFT JOIN calendar_oauth_accounts o ON o.user_id = u.id
		 GROUP BY u.id
		 ORDER BY u.last_login_at DESC`
	).all<Record<string, unknown>>()
	return res?.results ?? []
}

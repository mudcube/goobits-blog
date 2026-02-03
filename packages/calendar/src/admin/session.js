const ADMIN_SESSION_COOKIE = 'admin_session'
const DEFAULT_SESSION_TTL_SECONDS = 60 * 24 * 60 * 60

function toHex(buffer) {
	return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashToken(token) {
	const data = new TextEncoder().encode(token)
	const digest = await crypto.subtle.digest('SHA-256', data)
	return toHex(digest)
}

export function generateSessionToken() {
	const bytes = new Uint8Array(32)
	crypto.getRandomValues(bytes)
	return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createAdminSession({ db, ttlSeconds = DEFAULT_SESSION_TTL_SECONDS }) {
	const token = generateSessionToken()
	const tokenHash = await hashToken(token)
	const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds

	await db.prepare(
		`INSERT INTO admin_sessions (id, expires_at, created_at)
		 VALUES (?, ?, strftime('%s','now'))`
	).bind(tokenHash, expiresAt).run()

	return { token, expiresAt }
}

export async function validateAdminSession({ db, token, ttlSeconds = DEFAULT_SESSION_TTL_SECONDS, rotateAfterSeconds = null }) {
	if (!token) return false
	const tokenHash = await hashToken(token)
	const row = await db.prepare(
		`SELECT id, expires_at FROM admin_sessions WHERE id = ? LIMIT 1`
	).bind(tokenHash).first()
	if (!row) return false

	const now = Math.floor(Date.now() / 1000)
	if (now >= row.expires_at) {
		await db.prepare(`DELETE FROM admin_sessions WHERE id = ?`).bind(tokenHash).run()
		return { valid: false, expiresAt: null, rotated: false }
	}

	let rotated = false
	let expiresAt = row.expires_at
	if (rotateAfterSeconds !== null) {
		const remaining = row.expires_at - now
		if (remaining <= rotateAfterSeconds) {
			expiresAt = now + ttlSeconds
			await db.prepare(`UPDATE admin_sessions SET expires_at = ? WHERE id = ?`).bind(expiresAt, tokenHash).run()
			rotated = true
		}
	}

	return { valid: true, expiresAt, rotated }
}

export async function deleteAdminSession({ db, token }) {
	if (!token) return
	const tokenHash = await hashToken(token)
	await db.prepare(`DELETE FROM admin_sessions WHERE id = ?`).bind(tokenHash).run()
}

export function getAdminSessionCookie(token, expiresAt, { secure = true } = {}) {
	const expires = new Date(expiresAt * 1000).toUTCString()
	const secureFlag = secure ? ' Secure;' : ''
	return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict;${secureFlag} Expires=${expires}`
}

export function clearAdminSessionCookie({ secure = true } = {}) {
	const secureFlag = secure ? ' Secure;' : ''
	return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict;${secureFlag} Max-Age=0`
}

export function parseAdminSessionCookie(cookieHeader) {
	if (!cookieHeader) return null
	const cookies = Object.fromEntries(
		cookieHeader.split(';').map(c => {
			const [key, ...rest] = c.trim().split('=')
			return [key, rest.join('=')]
		})
	)
	return cookies[ADMIN_SESSION_COOKIE] || null
}

export { ADMIN_SESSION_COOKIE, DEFAULT_SESSION_TTL_SECONDS }

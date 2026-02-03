const SESSION_COOKIE_NAME = 'rainbow_session'
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60 // 7 days

export function generateSessionId() {
	const bytes = new Uint8Array(32)
	crypto.getRandomValues(bytes)
	return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createSession({ db, userId }) {
	const sessionId = generateSessionId()
	const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS

	await db.prepare(
		`INSERT INTO rainbow_sessions (id, user_id, expires_at, created_at)
		 VALUES (?, ?, ?, strftime('%s','now'))`
	).bind(sessionId, userId, expiresAt).run()

	return { sessionId, expiresAt }
}

export async function validateSession({ db, sessionId }) {
	if (!sessionId) return null

	const row = await db.prepare(
		`SELECT s.id, s.user_id, s.expires_at, u.id as uid, u.provider, u.email, u.name, u.avatar_url
		 FROM rainbow_sessions s
		 JOIN rainbow_users u ON s.user_id = u.id
		 WHERE s.id = ? LIMIT 1`
	).bind(sessionId).first()

	if (!row) return null

	const now = Math.floor(Date.now() / 1000)
	if (now >= row.expires_at) {
		await deleteSession({ db, sessionId })
		return null
	}

	return {
		id: row.uid,
		provider: row.provider,
		email: row.email,
		name: row.name,
		avatarUrl: row.avatar_url
	}
}

export async function deleteSession({ db, sessionId }) {
	await db.prepare(
		`DELETE FROM rainbow_sessions WHERE id = ?`
	).bind(sessionId).run()
}

export function getSessionCookie(sessionId, expiresAt, { secure = true } = {}) {
	const expires = new Date(expiresAt * 1000).toUTCString()
	const secureFlag = secure ? ' Secure;' : ''
	return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax;${secureFlag} Expires=${expires}`
}

export function clearSessionCookie({ secure = true } = {}) {
	const secureFlag = secure ? ' Secure;' : ''
	return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax;${secureFlag} Max-Age=0`
}

export function parseSessionCookie(cookieHeader) {
	if (!cookieHeader) return null
	const cookies = Object.fromEntries(
		cookieHeader.split(';').map(c => {
			const [key, ...rest] = c.trim().split('=')
			return [key, rest.join('=')]
		})
	)
	return cookies[SESSION_COOKIE_NAME] || null
}

export { SESSION_COOKIE_NAME }

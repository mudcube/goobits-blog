import { decryptString, encryptString } from '../security/crypto.js'

export async function getConnection({ db, provider, base64Key }) {
	const row = await db.prepare(
		`SELECT provider, access_token, refresh_token, expires_at, scope FROM connections WHERE provider = ? LIMIT 1`
	).bind(provider).first()
	if (!row) return null

	return {
		provider: row.provider,
		accessToken: await decryptString({ ciphertext: row.access_token, base64Key }),
		refreshToken: await decryptString({ ciphertext: row.refresh_token, base64Key }),
		expiresAt: row.expires_at,
		scope: row.scope
	}
}

export async function saveConnection({ db, provider, token, base64Key }) {
	const encAccess = await encryptString({ plaintext: token.accessToken, base64Key })
	const encRefresh = await encryptString({ plaintext: token.refreshToken, base64Key })

	await db.prepare(
		`INSERT INTO connections (provider, access_token, refresh_token, expires_at, scope, updated_at)
		 VALUES (?, ?, ?, ?, ?, strftime('%s','now'))
		 ON CONFLICT(provider) DO UPDATE SET
		  access_token = excluded.access_token,
		  refresh_token = excluded.refresh_token,
		  expires_at = excluded.expires_at,
		  scope = excluded.scope,
		  updated_at = strftime('%s','now')`
	)
		.bind(provider, encAccess, encRefresh, token.expiresAt, token.scope ?? null)
		.run()
}

export async function createBooking({ db, booking }) {
	const result = await db.prepare(
		`INSERT INTO bookings (idempotency_key, start_at, end_at, timezone, seats, name, email, note, status, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))`
	)
		.bind(
			booking.idempotencyKey,
			booking.start,
			booking.end,
			booking.timezone,
			booking.seats,
			booking.name,
			booking.email,
			booking.note ?? null,
			booking.status ?? 'pending'
		)
		.run()

	return { id: result.meta.last_row_id }
}

export async function getBookingByIdempotency({ db, idempotencyKey }) {
	if (!idempotencyKey) return null
	return db.prepare(
		`SELECT * FROM bookings WHERE idempotency_key = ? LIMIT 1`
	).bind(idempotencyKey).first()
}

export async function listBookingsBetween({ db, start, end }) {
	const res = await db.prepare(
		`SELECT * FROM bookings WHERE status = 'confirmed' AND start_at < ? AND end_at > ?`
	).bind(end, start).all()
	return res?.results ?? []
}

export async function attachEventLink({ db, bookingId, provider, calendarId, eventId, htmlLink }) {
	await db.prepare(
		`INSERT INTO event_links (booking_id, provider, calendar_id, event_id, html_link)
		 VALUES (?, ?, ?, ?, ?)`
	).bind(bookingId, provider, calendarId, eventId, htmlLink ?? null).run()
}

export async function getEventLinks({ db, bookingId }) {
	const res = await db.prepare(
		`SELECT * FROM event_links WHERE booking_id = ?`
	).bind(bookingId).all()
	return res?.results ?? []
}

export async function cancelBooking({ db, bookingId }) {
	await db.prepare(
		`UPDATE bookings SET status = 'canceled' WHERE id = ?`
	).bind(bookingId).run()
}

export async function confirmBooking({ db, bookingId }) {
	await db.prepare(
		`UPDATE bookings SET status = 'confirmed' WHERE id = ?`
	).bind(bookingId).run()
}

export async function createOauthState({ db, state }) {
	await db.prepare(
		`INSERT INTO oauth_states (state, created_at) VALUES (?, strftime('%s','now'))`
	).bind(state).run()
}

export async function consumeOauthState({ db, state, maxAgeSeconds = 600 }) {
	const row = await db.prepare(
		`SELECT state, created_at FROM oauth_states WHERE state = ? LIMIT 1`
	).bind(state).first()
	if (!row) return false

	const now = Math.floor(Date.now() / 1000)
	if (now - row.created_at > maxAgeSeconds) {
		await db.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()
		return false
	}

	await db.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run()
	return true
}

export async function checkRateLimit({ db, key, limit = 30, windowSeconds = 60 }) {
	const now = Math.floor(Date.now() / 1000)
	const row = await db.prepare(
		`SELECT key, count, reset_at FROM rate_limits WHERE key = ? LIMIT 1`
	).bind(key).first()

	if (!row || now >= row.reset_at) {
		await db.prepare(
			`INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
			 ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at`
		).bind(key, now + windowSeconds).run()
		return { allowed: true, remaining: limit - 1, resetAt: now + windowSeconds }
	}

	if (row.count >= limit) {
		return { allowed: false, remaining: 0, resetAt: row.reset_at }
	}

	await db.prepare(
		`UPDATE rate_limits SET count = count + 1 WHERE key = ?`
	).bind(key).run()

	return { allowed: true, remaining: limit - (row.count + 1), resetAt: row.reset_at }
}

export function generateInviteCode() {
	const bytes = new Uint8Array(12)
	crypto.getRandomValues(bytes)
	return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createInvite({ db, email = null, usesRemaining = 1, expiresAt = null }) {
	const code = generateInviteCode()

	const result = await db.prepare(
		`INSERT INTO calendar_invites (code, email, uses_remaining, expires_at, created_at)
		 VALUES (?, ?, ?, ?, strftime('%s','now'))`
	).bind(code, email, usesRemaining, expiresAt).run()

	return { id: result.meta.last_row_id, code }
}

export async function validateInvite({ db, code, email = null }) {
	if (!code) return { valid: false, reason: 'missing_code' }

	const invite = await db.prepare(
		`SELECT id, code, email, uses_remaining, expires_at FROM calendar_invites WHERE code = ? LIMIT 1`
	).bind(code).first()

	if (!invite) return { valid: false, reason: 'not_found' }

	const now = Math.floor(Date.now() / 1000)
	if (invite.expires_at && now >= invite.expires_at) {
		return { valid: false, reason: 'expired' }
	}

	if (invite.uses_remaining !== null && invite.uses_remaining <= 0) {
		return { valid: false, reason: 'exhausted' }
	}

	if (invite.email && email && invite.email.toLowerCase() !== email.toLowerCase()) {
		return { valid: false, reason: 'email_mismatch' }
	}

	return { valid: true, invite }
}

export async function consumeInvite({ db, inviteId, userId }) {
	await db.prepare(
		`UPDATE calendar_invites SET uses_remaining = uses_remaining - 1 WHERE id = ? AND uses_remaining > 0`
	).bind(inviteId).run()

	await db.prepare(
		`INSERT INTO calendar_invite_redemptions (invite_id, user_id, redeemed_at)
		 VALUES (?, ?, strftime('%s','now'))`
	).bind(inviteId, userId).run()
}

export async function listInvites({ db }) {
	const res = await db.prepare(
		`SELECT i.*, COUNT(r.id) as times_used
		 FROM calendar_invites i
		 LEFT JOIN calendar_invite_redemptions r ON i.id = r.invite_id
		 GROUP BY i.id
		 ORDER BY i.created_at DESC`
	).all()
	return res?.results ?? []
}

export async function deleteInvite({ db, inviteId }) {
	await db.prepare(`DELETE FROM calendar_invites WHERE id = ?`).bind(inviteId).run()
}

export async function hasUserRedeemedAnyInvite({ db, userId }) {
	const row = await db.prepare(
		`SELECT id FROM calendar_invite_redemptions WHERE user_id = ? LIMIT 1`
	).bind(userId).first()
	return !!row
}

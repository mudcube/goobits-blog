import type { D1DatabaseLike } from '../storage/d1.ts'

async function resolveInviteConsumeFailure(db: D1DatabaseLike, inviteId: number) {
	const invite = await db.prepare(
		`SELECT uses_remaining, expires_at FROM calendar_invites WHERE id = ? LIMIT 1`
	).bind(inviteId).first<{ uses_remaining: number | null; expires_at: number | null }>()
	const now = Math.floor(Date.now() / 1000)
	if (invite?.expires_at && now >= invite.expires_at) {
		return { ok: false as const, reason: 'expired' as const }
	}
	if (invite?.uses_remaining !== null && (invite?.uses_remaining ?? 0) <= 0) {
		return { ok: false as const, reason: 'exhausted' as const }
	}
	return { ok: false as const, reason: 'exhausted' as const }
}

import { INVITE_ADJECTIVES, INVITE_NOUNS } from './invite-words'

const INVITE_SEPARATORS = ['-', '-', '-', '.', '!']

export function generateInviteCode() {
	const bytes = new Uint8Array(6)
	crypto.getRandomValues(bytes)
	const adj = INVITE_ADJECTIVES[bytes[0]! % INVITE_ADJECTIVES.length]
	const noun = INVITE_NOUNS[bytes[1]! % INVITE_NOUNS.length]
	const num = ((bytes[2]! << 8 | bytes[3]!) % 9000) + 1000 // 1000–9999
	const sep = INVITE_SEPARATORS[bytes[4]! % INVITE_SEPARATORS.length]
	const sep2 = INVITE_SEPARATORS[bytes[5]! % INVITE_SEPARATORS.length]
	return `${adj}${sep}${noun}${sep2}${num}`
}

export async function createInvite({
	db,
	email = null,
	usesRemaining = 1,
	expiresAt = null
}: {
	db: D1DatabaseLike
	email?: string | null
	usesRemaining?: number
	expiresAt?: number | null
}) {
	const code = generateInviteCode()

	const result = await db.prepare(
		`INSERT INTO calendar_invites (code, email, uses_remaining, expires_at, created_at)
		 VALUES (?, ?, ?, ?, strftime('%s','now'))`
	).bind(code, email, usesRemaining, expiresAt).run()

	return { id: result.meta.last_row_id, code, email }
}

export async function validateInvite({
	db,
	code,
	email = null
}: {
	db: D1DatabaseLike
	code: string
	email?: string | null
}) {
	if (!code) return { valid: false, reason: 'missing_code' }

	const invite = await db.prepare(
		`SELECT id, code, email, uses_remaining, expires_at FROM calendar_invites WHERE code = ? LIMIT 1`
	).bind(code).first() as {
		id: number
		code: string
		email: string | null
		uses_remaining: number | null
		expires_at: number | null
	} | null

	if (!invite) return { valid: false, reason: 'not_found' }

	const now = Math.floor(Date.now() / 1000)
	if (invite.expires_at && now >= invite.expires_at) {
		return { valid: false, reason: 'expired' }
	}

	if (invite.uses_remaining !== null && invite.uses_remaining <= 0) {
		return { valid: false, reason: 'exhausted' }
	}

	if (invite.email && email && String(invite.email).toLowerCase() !== email.toLowerCase()) {
		return { valid: false, reason: 'email_mismatch' }
	}

	return { valid: true, invite }
}

export async function consumeInvite({
	db,
	inviteId,
	userId,
	usesRemaining = 1
}: {
	db: D1DatabaseLike
	inviteId: number
	userId: string
	usesRemaining?: number | null
}) {
	if (usesRemaining !== null) {
		const update = await db.prepare(
			`UPDATE calendar_invites
			 SET uses_remaining = uses_remaining - 1
			 WHERE id = ?
			   AND uses_remaining > 0
			   AND (expires_at IS NULL OR expires_at > strftime('%s','now'))`
		).bind(inviteId).run()
		if ((update.meta?.changes ?? 0) < 1) {
			return resolveInviteConsumeFailure(db, inviteId)
		}
	} else {
		const invite = await db.prepare(
			`SELECT expires_at FROM calendar_invites WHERE id = ? LIMIT 1`
		).bind(inviteId).first<{ expires_at: number | null }>()
		const now = Math.floor(Date.now() / 1000)
		if (!invite || (invite.expires_at && now >= invite.expires_at)) {
			return { ok: false as const, reason: 'expired' as const }
		}
	}

	await db.prepare(
		`INSERT INTO calendar_invite_redemptions (invite_id, user_id, redeemed_at)
		 VALUES (?, ?, strftime('%s','now'))`
	).bind(inviteId, userId).run()

	return { ok: true as const }
}

export async function listInvites({ db }: { db: D1DatabaseLike }) {
	const res = await db.prepare(
		`SELECT i.*, COUNT(r.id) as times_used
		 FROM calendar_invites i
		 LEFT JOIN calendar_invite_redemptions r ON i.id = r.invite_id
		 GROUP BY i.id
		 ORDER BY i.created_at DESC`
	).all()
	return res?.results ?? []
}

export async function deleteInvite({ db, inviteId }: { db: D1DatabaseLike; inviteId: number }) {
	await db.prepare(`DELETE FROM calendar_invites WHERE id = ?`).bind(inviteId).run()
}

export async function hasUserRedeemedAnyInvite({ db, userId }: { db: D1DatabaseLike; userId: string }) {
	const row = await db.prepare(
		`SELECT id FROM calendar_invite_redemptions WHERE user_id = ? LIMIT 1`
	).bind(userId).first()
	return !!row
}

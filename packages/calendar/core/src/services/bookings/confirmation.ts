import type { D1DatabaseLike } from '../storage/d1.ts'

export function generateConfirmationId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16))
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function setConfirmationId(db: D1DatabaseLike, participantId: number): Promise<string> {
	for (let attempt = 0; attempt < 3; attempt++) {
		const confirmationId = generateConfirmationId()
		try {
			const result = await db
				.prepare(
					`UPDATE calendar_event_participants
				 SET confirmation_id = ?
				 WHERE id = ? AND confirmation_id IS NULL`
				)
				.bind(confirmationId, participantId)
				.run()
			if ((result.meta?.changes ?? 0) > 0) return confirmationId

			const existing = await db
				.prepare(`SELECT confirmation_id FROM calendar_event_participants WHERE id = ? LIMIT 1`)
				.bind(participantId)
				.first<{ confirmation_id: string | null }>()
			if (existing?.confirmation_id) return existing.confirmation_id
			return confirmationId
		} catch (err) {
			const msg = err instanceof Error ? err.message : ''
			if (msg.includes('UNIQUE') && attempt < 2) continue
			throw err
		}
	}
	throw new Error('Failed to generate unique confirmation ID after retries')
}

export async function getBookingByConfirmation(
	db: D1DatabaseLike,
	confirmationId: string
): Promise<{
	id: number
	event_id: number
	user_id: string
	status: string
	guest_count: number
	confirmation_id: string
	event_title: string | null
	event_start: string | null
	event_end: string | null
	activity_slug: string | null
} | null> {
	const row = await db
		.prepare(
			`SELECT
			p.id, p.event_id, p.user_id, p.status, p.guest_count, p.confirmation_id,
			e.title AS event_title, e.starts_at AS event_start, e.ends_at AS event_end, e.activity_slug
		 FROM calendar_event_participants p
		 JOIN calendar_events e ON e.id = p.event_id
		 WHERE p.confirmation_id = ?
		 LIMIT 1`
		)
		.bind(confirmationId)
		.first()
	if (!row) return null
	return {
		id: row['id'] as number,
		event_id: row['event_id'] as number,
		user_id: row['user_id'] as string,
		status: row['status'] as string,
		guest_count: row['guest_count'] as number,
		confirmation_id: row['confirmation_id'] as string,
		event_title: row['event_title'] as string | null,
		event_start: row['event_start'] as string | null,
		event_end: row['event_end'] as string | null,
		activity_slug: row['activity_slug'] as string | null
	}
}

export async function cancelBookingByConfirmation(
	db: D1DatabaseLike,
	confirmationId: string,
	userId: string
): Promise<{ ok: boolean; code?: string; eventId?: number }> {
	const booking = await getBookingByConfirmation(db, confirmationId)
	if (!booking) return { ok: false, code: 'not_found' }
	if (booking.user_id !== userId) return { ok: false, code: 'forbidden' }
	if (booking.status === 'left' || booking.status === 'cancelled' || booking.status === 'canceled') {
		return { ok: false, code: 'already_cancelled' }
	}

	await db
		.prepare(
			`UPDATE calendar_event_participants SET status = 'left', guest_count = 0, updated_at = unixepoch() WHERE id = ?`
		)
		.bind(booking.id)
		.run()

	return { ok: true, eventId: booking.event_id }
}

import type { D1DatabaseLike } from '../storage/d1.ts'

export type PromoteWaitlistResult = {
	status: 'promoted' | 'already_joined' | 'full' | 'not_found'
}

export async function promoteWaitlistedParticipant(
	db: D1DatabaseLike,
	input: { eventId: number; entryId: number }
): Promise<PromoteWaitlistResult> {
	const participant = await db.prepare(
		`SELECT id, event_id, user_id, guest_count, status
		 FROM calendar_event_participants
		 WHERE id = ? AND event_id = ?
		 LIMIT 1`
	).bind(input.entryId, input.eventId).first<{
		id: number
		event_id: number
		user_id: string
		guest_count: number
		status: 'joined' | 'waitlist' | 'left'
	}>()

	if (!participant) return { status: 'not_found' }
	if (participant.status === 'joined') return { status: 'already_joined' }
	if (participant.status !== 'waitlist') return { status: 'not_found' }

	const event = await db.prepare(
		`SELECT capacity FROM calendar_events WHERE id = ? LIMIT 1`
	).bind(input.eventId).first<{ capacity: number }>()
	if (!event) return { status: 'not_found' }

	const joinedSummary = await db.prepare(
		`SELECT COALESCE(SUM(1 + guest_count), 0) AS seats_taken
		 FROM calendar_event_participants
		 WHERE event_id = ? AND status = 'joined'`
	).bind(input.eventId).first<{ seats_taken: number }>()

	const seatsTaken = joinedSummary?.seats_taken ?? 0
	const seatsNeeded = 1 + Math.max(0, participant.guest_count ?? 0)
	if (seatsTaken + seatsNeeded > event.capacity) {
		return { status: 'full' }
	}

	await db.prepare(
		`UPDATE calendar_event_participants
		 SET status = 'joined', updated_at = unixepoch()
		 WHERE id = ? AND event_id = ? AND status = 'waitlist'`
	).bind(input.entryId, input.eventId).run()

	return { status: 'promoted' }
}

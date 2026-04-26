import type { D1DatabaseLike } from '../storage/d1.ts'

export type SlotAvailabilityResult = {
	eventId: number
	title: string | null
	activitySlug: string | null
	startAt: string
	endAt: string
	capacity: number
	joined: number
	remaining: number
	available: boolean
	participants: Array<{
		userId: string
		name: string | null
		status: string
	}>
}

export async function getSlotAvailability(
	db: D1DatabaseLike,
	input: { date: string; activitySlug?: string }
): Promise<SlotAvailabilityResult[]> {
	const dayStart = `${input.date}T00:00:00Z`
	const dayEnd = `${input.date}T23:59:59Z`

	let query = `
		SELECT
			e.id, e.title, e.activity_slug, e.start_at, e.end_at, e.capacity,
			COALESCE(
				(SELECT SUM(1 + guest_count) FROM calendar_event_participants
				 WHERE event_id = e.id AND status = 'joined'), 0
			) AS joined_count
		FROM calendar_events e
		WHERE e.start_at >= ? AND e.start_at <= ? AND e.status != 'cancelled'
	`
	const binds: (string | number)[] = [dayStart, dayEnd]

	if (input.activitySlug) {
		query += ` AND e.activity_slug = ?`
		binds.push(input.activitySlug)
	}

	query += ` ORDER BY e.start_at ASC`

	const { results } = await db.prepare(query).bind(...binds).all()

	const slots: SlotAvailabilityResult[] = []

	for (const row of results ?? []) {
		const eventId = row['id'] as number
		const capacity = row['capacity'] as number
		const joined = row['joined_count'] as number

		const { results: participantRows } = await db.prepare(
			`SELECT p.user_id, u.name, p.status
			 FROM calendar_event_participants p
			 LEFT JOIN calendar_users u ON u.id = p.user_id
			 WHERE p.event_id = ? AND p.status = 'joined'
			 ORDER BY p.created_at ASC`
		).bind(eventId).all()

		slots.push({
			eventId,
			title: row['title'] as string | null,
			activitySlug: row['activity_slug'] as string | null,
			startAt: row['start_at'] as string,
			endAt: row['end_at'] as string,
			capacity,
			joined,
			remaining: Math.max(0, capacity - joined),
			available: joined < capacity,
			participants: (participantRows ?? []).map(p => ({
				userId: p['user_id'] as string,
				name: p['name'] as string | null,
				status: p['status'] as string
			}))
		})
	}

	return slots
}

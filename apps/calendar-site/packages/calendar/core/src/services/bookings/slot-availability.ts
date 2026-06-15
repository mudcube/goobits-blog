import type { D1DatabaseLike } from '../../storage/d1.ts'

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
}

const MAX_SLOTS_PER_DAY = 50

export async function getSlotAvailability(
	db: D1DatabaseLike,
	input: { date: string; activitySlug?: string }
): Promise<SlotAvailabilityResult[]> {
	const dayStart = `${input.date}T00:00:00Z`
	const dayEnd = `${input.date}T23:59:59Z`

	let query = `
		SELECT
			e.id, e.title, e.activity_slug, e.starts_at, e.ends_at, e.capacity,
			COALESCE(
				(SELECT SUM(1 + guest_count) FROM calendar_event_participants
				 WHERE event_id = e.id AND status = 'joined'), 0
			) AS joined_count
		FROM calendar_events e
		WHERE e.starts_at >= ? AND e.starts_at <= ?
		  AND e.status NOT IN ('cancelled', 'canceled')
	`
	const binds: (string | number)[] = [dayStart, dayEnd]

	if (input.activitySlug) {
		query += ` AND e.activity_slug = ?`
		binds.push(input.activitySlug)
	}

	query += ` ORDER BY e.starts_at ASC LIMIT ${MAX_SLOTS_PER_DAY}`

	const { results } = await db.prepare(query).bind(...binds).all()

	return (results ?? []).map(row => {
		const capacity = row['capacity'] as number
		const joined = row['joined_count'] as number
		return {
			eventId: row['id'] as number,
			title: row['title'] as string | null,
			activitySlug: row['activity_slug'] as string | null,
			startAt: row['starts_at'] as string,
			endAt: row['ends_at'] as string,
			capacity,
			joined,
			remaining: Math.max(0, capacity - joined),
			available: joined < capacity,
		}
	})
}

import type { D1DatabaseLike } from '../storage/d1.ts'

export type AdminEventDetail = {
	event: {
		id: number
		activitySlug: string
		activityLabel: string
		title: string
		startsAt: string
		endsAt: string
		capacity: number
		seatsTaken: number
		seatsLeft: number
		waitlistCount: number
		costCents: number
		currency: string
		paymentProvider: string | null
		paymentHandle: string | null
		paymentNoteTemplate: string | null
		recapText: string | null
		heroImageUrl: string | null
	}
	attendees: Array<{
		entryId: number
		userId: string
		name: string | null
		email: string | null
		status: 'joined' | 'waitlist'
		guestCount: number
		waitlistPosition: number | null
		attendanceStatus: 'unknown' | 'attended' | 'flaked'
		joinedAt: string
	}>
}

export async function getAdminEventDetail(
	db: D1DatabaseLike,
	eventId: number
): Promise<AdminEventDetail | null> {
	const row = await db.prepare(
		`SELECT e.id, e.activity_slug, p.label AS activity_label, e.title, e.starts_at, e.ends_at, e.capacity,
		        e.cost_cents, e.currency, e.payment_provider, e.payment_handle, e.payment_note_template,
		        e.recap_text, e.hero_image_url
		 FROM calendar_events e
		 LEFT JOIN calendar_programs p ON p.slug = e.activity_slug
		 WHERE e.id = ?
		 LIMIT 1`
	).bind(eventId).first<{
		id: number
		activity_slug: string
		activity_label: string | null
		title: string
		starts_at: string
		ends_at: string
		capacity: number
		cost_cents: number
		currency: string
		payment_provider: string | null
		payment_handle: string | null
		payment_note_template: string | null
		recap_text: string | null
		hero_image_url: string | null
	}>()
	if (!row) return null

	const participants = await db.prepare(
		`SELECT p.id, CAST(p.user_id AS TEXT) AS user_id, p.guest_count, p.status, p.attendance_status, p.created_at, u.name, u.email
		 FROM calendar_event_participants p
		 LEFT JOIN calendar_users u ON CAST(u.id AS TEXT) = CAST(p.user_id AS TEXT)
		 WHERE p.event_id = ? AND p.status IN ('joined','waitlist')
		 ORDER BY p.created_at ASC`
	).bind(eventId).all<{
		id: number
		user_id: string
		guest_count: number
		status: 'joined' | 'waitlist'
		attendance_status: 'unknown' | 'attended' | 'flaked' | null
		created_at: number
		name: string | null
		email: string | null
	}>()

	let waitlistCounter = 0
	const attendees = (participants?.results ?? []).map((item) => {
		if (item.status === 'waitlist') waitlistCounter += 1
		const attendanceStatus: 'unknown' | 'attended' | 'flaked' =
			item.attendance_status === 'attended' || item.attendance_status === 'flaked'
				? item.attendance_status
				: 'unknown'
		return {
			entryId: item.id,
			userId: item.user_id,
			name: item.name,
			email: item.email,
			status: item.status,
			guestCount: Math.max(0, item.guest_count ?? 0),
			waitlistPosition: item.status === 'waitlist' ? waitlistCounter : null,
			attendanceStatus,
			joinedAt: new Date((item.created_at ?? 0) * 1000).toISOString()
		}
	})

	const seatsTaken = attendees
		.filter((item) => item.status === 'joined')
		.reduce((sum, item) => sum + 1 + item.guestCount, 0)
	const waitlistCount = attendees.filter((item) => item.status === 'waitlist').length

	return {
		event: {
			id: row.id,
			activitySlug: row.activity_slug,
			activityLabel: row.activity_label || row.activity_slug,
			title: row.title,
			startsAt: row.starts_at,
			endsAt: row.ends_at,
			capacity: row.capacity,
			seatsTaken,
			seatsLeft: Math.max(0, row.capacity - seatsTaken),
			waitlistCount,
			costCents: row.cost_cents ?? 0,
			currency: row.currency ?? 'USD',
			paymentProvider: row.payment_provider,
			paymentHandle: row.payment_handle,
			paymentNoteTemplate: row.payment_note_template,
			recapText: row.recap_text,
			heroImageUrl: row.hero_image_url
		},
		attendees
	}
}

import type { D1DatabaseLike } from '../storage/d1.ts'

export type CalendarEventTemplate = {
	id: number
	title: string
	activitySlug: string
	capacity: number
	costCents: number
	currency: string
	paymentProvider: string | null
	paymentHandle: string | null
	paymentNoteTemplate: string | null
	location: string | null
	note: string | null
}

export async function listEventTemplates(db: D1DatabaseLike, limit = 20): Promise<CalendarEventTemplate[]> {
	const rows = await db.prepare(
		`SELECT id, title, activity_slug, capacity, cost_cents, currency,
		        payment_provider, payment_handle, payment_note_template, location, note
		 FROM calendar_events
		 WHERE status = 'scheduled'
		 ORDER BY datetime(starts_at) DESC
		 LIMIT ?`
	).bind(Math.max(1, Math.min(100, limit))).all<{
		id: number
		title: string
		activity_slug: string
		capacity: number
		cost_cents: number
		currency: string
		payment_provider: string | null
		payment_handle: string | null
		payment_note_template: string | null
		location: string | null
		note: string | null
	}>()

	return (rows?.results ?? []).map((row) => ({
		id: row.id,
		title: row.title,
		activitySlug: row.activity_slug,
		capacity: row.capacity,
		costCents: row.cost_cents ?? 0,
		currency: row.currency ?? 'USD',
		paymentProvider: row.payment_provider ?? null,
		paymentHandle: row.payment_handle ?? null,
		paymentNoteTemplate: row.payment_note_template ?? null,
		location: row.location ?? null,
		note: row.note ?? null
	}))
}

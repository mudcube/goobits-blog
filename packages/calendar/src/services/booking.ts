import { normalizeIdempotencyKey } from '../security/idempotency.ts'

export async function ensureIdempotentBooking({
	storage,
	booking
}: {
	storage: { getBookingByIdempotency: (args: { idempotencyKey: string }) => Promise<any> }
	booking: { idempotencyKey?: string | null }
}) {
	const idempotencyKey = normalizeIdempotencyKey(booking.idempotencyKey)
	if (!idempotencyKey) return { existing: null, idempotencyKey: null }

	const existing = await storage.getBookingByIdempotency({ idempotencyKey })
	return { existing, idempotencyKey }
}

export function buildEvent({
	booking,
	calendarName,
	location
}: {
	booking: any
	calendarName?: string
	location?: string
}) {
	const attendees = new Set()
	if (Array.isArray(booking.attendeeEmails)) {
		for (const email of booking.attendeeEmails) {
			if (email) attendees.add(email)
		}
	}
	if (booking.email) attendees.add(booking.email)

	let description = booking.note ? `Note: ${booking.note}` : undefined
	if (booking.cancelLink) {
		const cancelLine = `Need to cancel? No worries — use this private link: ${booking.cancelLink}`
		description = description ? `${description}\n${cancelLine}` : cancelLine
	}

	return {
		summary: `Rainbow Gym — ${booking.name}`,
		description,
		start: { dateTime: booking.start, timeZone: booking.timezone },
		end: { dateTime: booking.end, timeZone: booking.timezone },
		location: location ?? calendarName ?? 'Rainbow Gym',
		attendees: attendees.size ? Array.from(attendees).map(email => ({ email })) : undefined,
		guestsCanSeeOtherGuests: true,
		transparency: 'opaque'
	}
}

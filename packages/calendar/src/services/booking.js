import { normalizeIdempotencyKey } from '../security/idempotency.js'

export async function ensureIdempotentBooking({ storage, booking }) {
	const idempotencyKey = normalizeIdempotencyKey(booking.idempotencyKey)
	if (!idempotencyKey) return { existing: null, idempotencyKey: null }

	const existing = await storage.getBookingByIdempotency({ idempotencyKey })
	return { existing, idempotencyKey }
}

export function buildEvent({ booking, calendarName, location }) {
	return {
		summary: `Rainbow Gym — ${booking.name}`,
		description: booking.note ? `Note: ${booking.note}` : undefined,
		start: { dateTime: booking.start, timeZone: booking.timezone },
		end: { dateTime: booking.end, timeZone: booking.timezone },
		location: location ?? calendarName ?? 'Rainbow Gym',
		attendees: booking.attendeeEmails?.map(email => ({ email })) ?? undefined,
		guestsCanSeeOtherGuests: true,
		transparency: 'opaque'
	}
}

import { normalizeIdempotencyKey } from '../security/idempotency.ts'
import type { BookingRow } from '../storage/d1.ts'
import type { GoogleCalendarEventInput } from '../providers/google/events.ts'
import { getCalendarConfig } from '../config/calendar.ts'

type ExistingBooking = BookingRow | null
type BookingLike = {
	attendeeEmails?: Array<string | null | undefined> | null
	email?: string | null
	note?: string | null
	cancelLink?: string | null
	name: string
	start: string
	end: string
	timezone: string
}

export async function ensureIdempotentBooking({
	storage,
	booking
}: {
	storage: { getBookingByIdempotency: (args: { idempotencyKey: string }) => Promise<ExistingBooking> }
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
	booking: BookingLike
	calendarName?: string
	location?: string
}): GoogleCalendarEventInput {
	const configuredCalendarName = getCalendarConfig().brand.calendarName
	const attendees = new Set<string>()
	if (Array.isArray(booking.attendeeEmails)) {
		for (const email of booking.attendeeEmails) {
			if (typeof email === 'string' && email) attendees.add(email)
		}
	}
	if (typeof booking.email === 'string' && booking.email) attendees.add(booking.email)

	let description = booking.note ? `Note: ${booking.note}` : ''
	if (booking.cancelLink) {
		const cancelLine = `Need to cancel? No worries — use this private link: ${booking.cancelLink}`
		description = description ? `${description}\n${cancelLine}` : cancelLine
	}

	const event: GoogleCalendarEventInput = {
		summary: `${configuredCalendarName} — ${booking.name}`,
		start: { dateTime: booking.start, timeZone: booking.timezone },
		end: { dateTime: booking.end, timeZone: booking.timezone },
		location: location ?? calendarName ?? configuredCalendarName,
		guestsCanSeeOtherGuests: true,
		transparency: 'opaque'
	}
	if (description) {
		event.description = description
	}
	if (attendees.size) {
		event.attendees = Array.from(attendees).map(email => ({ email }))
	}
	return event
}

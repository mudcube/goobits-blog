import {
	ensureValidGoogleToken,
	getConnection,
	googleFreeBusy,
	googleCreateEvent,
	buildEvent,
	createBookingIfCapacity,
	getBookingByIdempotency,
	confirmBooking,
	cancelBooking,
	attachEventLink,
	ensureIdempotentBooking,
	saveConnection
} from '../../../packages/calendar/src/index.js'
import { enforceRateLimit, errorResponse, getCalendarIds, getCapacity, getLocation, getMinNoticeHours, getPrimaryCalendarId, getTokenKey, jsonResponse, readJson } from './_helpers.js'

function overlaps(aStart, aEnd, bStart, bEnd) {
	return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

function generateCancelToken() {
	const bytes = new Uint8Array(32)
	crypto.getRandomValues(bytes)
	return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function onRequest({ env, request }) {
	try {
		const rateLimit = await enforceRateLimit({ env, request, keySuffix: 'book', limit: 20, windowSeconds: 60 })
		if (rateLimit) return rateLimit

		const payload = await readJson(request)
		if (payload === null) return errorResponse('Invalid JSON', 400, 'invalid_json')
		const { start, end, timezone, seats, name, email, note, idempotencyKey, attendeeEmails } = payload

		if (!start || !end || !timezone || !name || !email) {
			return errorResponse('Missing required fields', 400, 'missing_fields')
		}

		const startTime = Date.parse(start)
		const endTime = Date.parse(end)
		if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
			return errorResponse('Invalid start or end time', 400, 'invalid_time')
		}
		if (endTime <= startTime) {
			return errorResponse('End time must be after start time', 400, 'invalid_range')
		}

		const seatCount = Number.parseInt(seats ?? 1, 10)
		if (!Number.isFinite(seatCount) || seatCount < 1) {
			return errorResponse('Invalid seats', 400, 'invalid_seats')
		}

		const capacity = getCapacity(env)
		if (seatCount > capacity) {
			return errorResponse('Seats exceed capacity', 400, 'capacity_exceeded')
		}

		const minNoticeMs = getMinNoticeHours(env) * 60 * 60 * 1000
		if (new Date(start).getTime() < Date.now() + minNoticeMs) {
			return errorResponse(`Bookings require at least ${getMinNoticeHours(env)} hours notice`, 400, 'min_notice')
		}

		const base64Key = getTokenKey(env)
		const connection = await getConnection({ db: env.DB, provider: 'google', base64Key })
		if (!connection) return errorResponse('Google not connected', 400, 'not_connected')

		const token = await ensureValidGoogleToken({ env, token: connection })
		if (token.expiresAt !== connection.expiresAt) {
			await saveConnection({ db: env.DB, provider: 'google', token, base64Key })
		}

		const calendarIds = getCalendarIds(env)
		if (calendarIds.length === 0) return errorResponse('No calendars configured', 400, 'no_calendars')
		const { busy } = await googleFreeBusy({
			accessToken: token.accessToken,
			timeMin: start,
			timeMax: end,
			calendarIds
		})

		const hasConflict = busy.some(range => overlaps(start, end, range.start, range.end))
		if (hasConflict) {
			return errorResponse('Time slot is busy', 409, 'busy')
		}

		const storage = {
			getBookingByIdempotency: ({ idempotencyKey: key }) => getBookingByIdempotency({ db: env.DB, idempotencyKey: key })
		}
		const { existing, idempotencyKey: normalizedKey } = await ensureIdempotentBooking({
			storage,
			booking: { idempotencyKey }
		})
		if (existing) {
			return jsonResponse({ ok: true, bookingId: existing.id, status: existing.status, cancelToken: existing.cancel_token ?? null })
		}

		const cancelToken = generateCancelToken()
		const booking = {
			start,
			end,
			timezone,
			seats: seatCount,
			name,
			email,
			note,
			idempotencyKey: normalizedKey,
			attendeeEmails,
			cancelToken
		}

		const bookingRecord = await createBookingIfCapacity({ db: env.DB, booking: { ...booking, status: 'pending' }, capacity })
		if (!bookingRecord) {
			return errorResponse('Slot is full', 409, 'full')
		}

		const event = buildEvent({ booking, location: getLocation(env) })
		const calendarId = getPrimaryCalendarId(env)
		let created = null
		try {
			created = await googleCreateEvent({
				accessToken: token.accessToken,
				calendarId,
				event
			})

			await attachEventLink({
				db: env.DB,
				bookingId: bookingRecord.id,
				provider: 'google',
				calendarId,
				eventId: created.id,
				htmlLink: created.htmlLink
			})

			await confirmBooking({ db: env.DB, bookingId: bookingRecord.id })
		} catch (err) {
			await cancelBooking({ db: env.DB, bookingId: bookingRecord.id })
			throw err
		}

		return jsonResponse({ ok: true, bookingId: bookingRecord.id, eventLink: created?.htmlLink, cancelToken })
	} catch (err) {
		return errorResponse(err?.message || 'Booking failed', 500, 'booking_error')
	}
}

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
	getEventLinks,
	saveConnection
} from '../../../packages/calendar/src/index.ts'
import { type EnvLike, enforceRateLimit, errorResponse, getCalendarIds, getCapacity, getLocation, getMinNoticeHours, getPrimaryCalendarId, getTokenKey, jsonResponse, readJson } from './_helpers.ts'

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
	return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

function generateCancelToken() {
	const bytes = new Uint8Array(32)
	crypto.getRandomValues(bytes)
	return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function normalizeText(value: unknown, maxLength: number) {
	if (typeof value !== 'string') return null
	const trimmed = value.trim()
	if (!trimmed) return null
	if (trimmed.length > maxLength) return null
	return trimmed
}

function normalizeEmail(value: unknown) {
	if (typeof value !== 'string') return null
	const trimmed = value.trim().toLowerCase()
	if (!trimmed || trimmed.length > 254) return null
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailPattern.test(trimmed) ? trimmed : null
}

function isValidTimeZone(value: unknown) {
	if (typeof value !== 'string' || value.length > 100) return false
	try {
		Intl.DateTimeFormat('en-US', { timeZone: value })
		return true
	} catch (err) {
		return false
	}
}

export async function onRequest({ env, request }: { env: EnvLike; request: Request }) {
	try {
		const rateLimit = await enforceRateLimit({ env, request, keySuffix: 'book', limit: 20, windowSeconds: 60 })
		if (rateLimit) return rateLimit

		const parsed = await readJson(request, { maxBytes: 8192 })
		if (!parsed.ok) {
			return errorResponse(
				parsed.error?.message ?? 'Invalid request',
				parsed.status ?? 400,
				parsed.error?.code ?? 'bad_request'
			)
		}
		const payload = (parsed.value && typeof parsed.value === 'object')
			? (parsed.value as Record<string, unknown>)
			: {}
		const start = payload['start']
		const end = payload['end']
		const timezone = payload['timezone']
		const seats = payload['seats']
		const name = payload['name']
		const email = payload['email']
		const note = payload['note']
		const idempotencyKey = payload['idempotencyKey']

		const normalizedName = normalizeText(name, 120)
		const normalizedEmail = normalizeEmail(email)
		const normalizedTimezone = typeof timezone === 'string' ? timezone.trim() : null
		const normalizedNote = typeof note === 'string' ? note.trim() : null
		const normalizedStart = typeof start === 'string' ? start : null
		const normalizedEnd = typeof end === 'string' ? end : null
		const normalizedIdempotencyKey = typeof idempotencyKey === 'string' ? idempotencyKey : null

		if (!normalizedStart || !normalizedEnd || !normalizedTimezone || !normalizedName || !normalizedEmail) {
			return errorResponse('Missing required fields', 400, 'missing_fields')
		}
		if (!isValidTimeZone(normalizedTimezone)) {
			return errorResponse('Invalid timezone', 400, 'invalid_timezone')
		}
		if (normalizedNote && normalizedNote.length > 1000) {
			return errorResponse('Note is too long', 400, 'note_too_long')
		}

		const startTime = Date.parse(normalizedStart)
		const endTime = Date.parse(normalizedEnd)
		if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
			return errorResponse('Invalid start or end time', 400, 'invalid_time')
		}
		if (endTime <= startTime) {
			return errorResponse('End time must be after start time', 400, 'invalid_range')
		}

		const seatValue = typeof seats === 'number' ? String(seats) : (typeof seats === 'string' ? seats : '1')
		const seatCount = Number.parseInt(seatValue, 10)
		if (!Number.isFinite(seatCount) || seatCount < 1) {
			return errorResponse('Invalid seats', 400, 'invalid_seats')
		}

		const capacity = getCapacity(env)
		if (seatCount > capacity) {
			return errorResponse('Seats exceed capacity', 400, 'capacity_exceeded')
		}

		const minNoticeMs = getMinNoticeHours(env) * 60 * 60 * 1000
		if (new Date(normalizedStart).getTime() < Date.now() + minNoticeMs) {
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
				timeMin: normalizedStart,
				timeMax: normalizedEnd,
				calendarIds
			})

		const hasConflict = busy.some(range => overlaps(normalizedStart, normalizedEnd, range.start, range.end))
		if (hasConflict) {
			return errorResponse('Time slot is busy', 409, 'busy')
		}

		const storage = {
			getBookingByIdempotency: ({ idempotencyKey: key }: { idempotencyKey: string }) =>
				getBookingByIdempotency({ db: env.DB, idempotencyKey: key })
		}
		const { existing, idempotencyKey: normalizedKey } = await ensureIdempotentBooking({
				storage,
				booking: { idempotencyKey: normalizedIdempotencyKey }
			})
		if (existing) {
			if ((existing.email || '').toLowerCase() !== normalizedEmail) {
				return errorResponse('Idempotency key already used', 409, 'idempotency_conflict')
			}
			// If a previous attempt crashed after DB insert but before Google event creation,
			// the booking is stuck in pending with no event link. Cancel it and let the retry
			// proceed with a fresh booking.
			if (existing.status === 'pending') {
				const links = await getEventLinks({ db: env.DB, bookingId: existing.id })
				if (!links || links.length === 0) {
					await cancelBooking({ db: env.DB, bookingId: existing.id })
					// Fall through to create a new booking below
				} else {
					return jsonResponse({ ok: true, status: existing.status, cancelToken: existing.cancel_token ?? null })
				}
			} else {
				return jsonResponse({ ok: true, status: existing.status, cancelToken: existing.cancel_token ?? null })
			}
		}

		const cancelToken = generateCancelToken()
		const cancelLink = new URL(`/calendar-gym?cancel=${cancelToken}`, request.url).toString()
			const booking = {
				start: normalizedStart,
				end: normalizedEnd,
			timezone: normalizedTimezone,
			seats: seatCount,
			name: normalizedName,
			email: normalizedEmail,
			note: normalizedNote ?? null,
			idempotencyKey: normalizedKey,
			cancelLink,
			cancelToken
		}

		const bookingRecord = await createBookingIfCapacity({ db: env.DB, booking: { ...booking, status: 'pending' }, capacity })
		if (!bookingRecord) {
			return errorResponse('Slot is full', 409, 'full')
		}

		const event = buildEvent({ booking, location: getLocation(env), calendarName: getLocation(env) })
		const calendarId = getPrimaryCalendarId(env)
		if (!calendarId) {
			return errorResponse('No primary calendar configured', 400, 'no_primary_calendar')
		}
		let created = null
		try {
			created = await googleCreateEvent({
				accessToken: token.accessToken,
				calendarId,
				event
			})
		} catch (err) {
			await cancelBooking({ db: env.DB, bookingId: bookingRecord.id })
			throw err
		}

		try {
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
			// Clean up the orphaned Google event before cancelling the booking
			try {
				const { deleteEvent } = await import('../../../packages/calendar/src/providers/google/events.ts')
				await deleteEvent({ accessToken: token.accessToken, calendarId, eventId: created.id })
			} catch {
				console.error('Failed to clean up orphaned Google event:', created.id)
			}
			await cancelBooking({ db: env.DB, bookingId: bookingRecord.id })
			throw err
		}

		return jsonResponse({ ok: true, eventLink: created?.htmlLink, cancelToken })
	} catch (err) {
		console.error('Booking error:', err)
		return errorResponse('Booking failed', 500, 'booking_error')
	}
}

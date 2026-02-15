import {
	ensureValidGoogleToken,
	getConnection,
	googleFreeBusy,
	listBookingsBetween,
	buildSlots,
	saveConnection
} from '../../../packages/calendar/src/index.ts'
import { type EnvLike, enforceRateLimit, errorResponse, getCalendarIds, getBufferMinutes, getCapacity, getMinNoticeHours, getSlotMinutes, getTokenKey, jsonResponse } from './_helpers.ts'

export async function onRequest({ env, request }: { env: EnvLike; request: Request }) {
	try {
		const rateLimit = await enforceRateLimit({ env, request, keySuffix: 'availability', limit: 60, windowSeconds: 60 })
		if (rateLimit) return rateLimit

		// For the UI, treat "not configured/connected" as a soft error to avoid noisy 400s in the console.
		// The client can still display a friendly message, but the fetch itself should be a 200.
		const softError = (code: string, message: string) => {
			return jsonResponse({ slots: [], error: { code, message } })
		}

		const url = new URL(request.url)
		const timeMin = url.searchParams.get('start')
		const timeMax = url.searchParams.get('end')
		if (!timeMin || !timeMax) {
			return errorResponse('Missing start or end', 400, 'missing_range')
		}
		const startMs = Date.parse(timeMin)
		const endMs = Date.parse(timeMax)
		if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
			return errorResponse('Invalid start or end time', 400, 'invalid_time')
		}
		if (endMs <= startMs) {
			return errorResponse('End time must be after start time', 400, 'invalid_range')
		}
		const maxRangeMs = 90 * 24 * 60 * 60 * 1000
		if (endMs - startMs > maxRangeMs) {
			return errorResponse('Range is too large', 400, 'range_too_large')
		}

		const calendarIds = getCalendarIds(env)
		if (calendarIds.length === 0) return softError('no_calendars', 'Calendar is not configured yet.')

		const base64Key = getTokenKey(env)
		let connection = null
		try {
			connection = await getConnection({ db: env.DB, provider: 'google', base64Key })
		} catch {
			console.warn('Availability: failed to load saved Google connection; treating as disconnected')
			return softError('not_connected', 'Calendar is being connected. Please try again soon.')
		}
		if (!connection) return softError('not_connected', 'Calendar is being connected. Please try again soon.')

		let token
		try {
			token = await ensureValidGoogleToken({ env, token: connection })
		} catch {
			console.warn('Availability: Google token invalid/expired and could not be refreshed')
			return softError('not_connected', 'Calendar needs to be reconnected. Please try again soon.')
		}
		if (token.expiresAt !== connection.expiresAt) {
			await saveConnection({ db: env.DB, provider: 'google', token, base64Key })
		}

		const { busy } = await googleFreeBusy({
			accessToken: token.accessToken,
			timeMin,
			timeMax,
			calendarIds
		})

		const bookings = await listBookingsBetween({ db: env.DB, start: timeMin, end: timeMax })

		const allSlots = buildSlots({
			timeMin,
			timeMax,
			slotMinutes: getSlotMinutes(env),
			bufferMinutes: getBufferMinutes(env),
			capacityPerSlot: getCapacity(env),
			busy,
			bookings
		})

		const minNoticeMs = getMinNoticeHours(env) * 60 * 60 * 1000
		const cutoff = Date.now() + minNoticeMs
		const slots = allSlots.filter(slot => new Date(slot.start).getTime() >= cutoff)

		return jsonResponse({ slots })
	} catch (err) {
		console.error('Availability error:', err)
		return errorResponse('Failed to load availability', 500, 'availability_error')
	}
}

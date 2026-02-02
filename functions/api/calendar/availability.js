import {
	ensureValidGoogleToken,
	getConnection,
	googleFreeBusy,
	listBookingsBetween,
	buildSlots,
	saveConnection
} from '../../../packages/calendar/src/index.js'
import { enforceRateLimit, errorResponse, getCalendarIds, getBufferMinutes, getCapacity, getMinNoticeHours, getSlotMinutes, getTokenKey, jsonResponse } from './_helpers.js'

export async function onRequest({ env, request }) {
	try {
		const rateLimit = await enforceRateLimit({ env, request, keySuffix: 'availability', limit: 60, windowSeconds: 60 })
		if (rateLimit) return rateLimit

		const url = new URL(request.url)
		const timeMin = url.searchParams.get('start')
		const timeMax = url.searchParams.get('end')
		if (!timeMin || !timeMax) {
			return errorResponse('Missing start or end', 400, 'missing_range')
		}

		const calendarIds = getCalendarIds(env)
		if (calendarIds.length === 0) return errorResponse('No calendars configured', 400, 'no_calendars')

		const base64Key = getTokenKey(env)
		const connection = await getConnection({ db: env.DB, provider: 'google', base64Key })
		if (!connection) return errorResponse('Google not connected', 400, 'not_connected')

		const token = await ensureValidGoogleToken({ env, token: connection })
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
		return errorResponse(err?.message || 'Failed to load availability', 500, 'availability_error')
	}
}

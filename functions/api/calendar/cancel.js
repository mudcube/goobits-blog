import {
	ensureValidGoogleToken,
	getConnection,
	googleDeleteEvent,
	getEventLinks,
	cancelBooking,
	saveConnection
} from '../../../packages/calendar/src/index.js'
import { enforceRateLimit, errorResponse, getTokenKey, jsonResponse, readJson } from './_helpers.js'

export async function onRequest({ env, request }) {
	try {
		const rateLimit = await enforceRateLimit({ env, request, keySuffix: 'cancel', limit: 20, windowSeconds: 60 })
		if (rateLimit) return rateLimit

		const payload = await readJson(request)
		const { bookingId } = payload
		if (!bookingId) return errorResponse('Missing bookingId', 400, 'missing_booking')

		const base64Key = getTokenKey(env)
		const connection = await getConnection({ db: env.DB, provider: 'google', base64Key })
		if (!connection) return errorResponse('Google not connected', 400, 'not_connected')

		const token = await ensureValidGoogleToken({ env, token: connection })
		if (token.expiresAt !== connection.expiresAt) {
			await saveConnection({ db: env.DB, provider: 'google', token, base64Key })
		}

		const links = await getEventLinks({ db: env.DB, bookingId })
		for (const link of links) {
			if (link.provider === 'google') {
				await googleDeleteEvent({
					accessToken: token.accessToken,
					calendarId: link.calendar_id,
					eventId: link.event_id
				})
			}
		}

		await cancelBooking({ db: env.DB, bookingId })

		return jsonResponse({ ok: true })
	} catch (err) {
		return errorResponse(err?.message || 'Cancel failed', 500, 'cancel_error')
	}
}

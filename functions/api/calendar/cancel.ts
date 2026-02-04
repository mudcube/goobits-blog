import {
	ensureValidGoogleToken,
	getConnection,
	getBookingByCancelToken,
	cancelBookingAndEvents,
	saveConnection
} from '../../../packages/calendar/src/index.ts'
import { enforceRateLimit, errorResponse, getTokenKey, jsonResponse, readJson } from './_helpers.ts'

type EnvLike = { DB?: any; [key: string]: any }

export async function onRequest({ env, request }: { env: EnvLike; request: Request }) {
	try {
		const rateLimit = await enforceRateLimit({ env, request, keySuffix: 'cancel', limit: 20, windowSeconds: 60 })
		if (rateLimit) return rateLimit

		const parsed = await readJson(request, { maxBytes: 2048 })
		if (!parsed.ok) {
			return errorResponse(
				parsed.error?.message ?? 'Invalid request',
				parsed.status ?? 400,
				parsed.error?.code ?? 'bad_request'
			)
		}
		const payload = parsed.value || {}
		const { cancelToken } = payload
		if (!cancelToken) return errorResponse('Missing cancel token', 400, 'missing_token')
		if (typeof cancelToken !== 'string' || cancelToken.length !== 64 || !/^[a-f0-9]+$/i.test(cancelToken)) {
			return errorResponse('Invalid cancel token', 400, 'invalid_token')
		}

		const booking = await getBookingByCancelToken({ db: env.DB, cancelToken })
		if (!booking) return errorResponse('Invalid cancel token', 404, 'invalid_token')

		const base64Key = getTokenKey(env)
		const connection = await getConnection({ db: env.DB, provider: 'google', base64Key })
		if (!connection) return errorResponse('Google not connected', 400, 'not_connected')

		const token = await ensureValidGoogleToken({ env, token: connection })
		if (token.expiresAt !== connection.expiresAt) {
			await saveConnection({ db: env.DB, provider: 'google', token, base64Key })
		}

		await cancelBookingAndEvents({ db: env.DB, accessToken: token.accessToken, bookingId: booking.id })

		return jsonResponse({ ok: true })
	} catch (err) {
		console.error('Cancel error:', err)
		return errorResponse('Cancel failed', 500, 'cancel_error')
	}
}

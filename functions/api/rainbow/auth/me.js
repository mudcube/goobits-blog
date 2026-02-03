import {
	errorResponse,
	jsonResponse,
	validateSession,
	parseSessionCookie
} from '../_helpers.js'

export async function onRequest({ env, request }) {
	if (request.method !== 'GET') {
		return errorResponse('Method not allowed', 405)
	}

	const cookieHeader = request.headers.get('Cookie')
	const sessionId = parseSessionCookie(cookieHeader)

	if (!sessionId) {
		return jsonResponse({ ok: true, user: null })
	}

	const user = await validateSession({ db: env.DB, sessionId })

	return jsonResponse({ ok: true, user })
}

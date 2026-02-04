import {
	errorResponse,
	jsonResponse,
	deleteSession,
	parseSessionCookie,
	clearSessionCookie
} from '../_helpers.js'

export async function onRequest({ env, request }) {
	if (request.method !== 'POST') {
		return errorResponse('Method not allowed', 405)
	}

	const cookieHeader = request.headers.get('Cookie')
	const sessionId = parseSessionCookie(cookieHeader)

	if (sessionId) {
		await deleteSession({ db: env.DB, sessionId })
	}

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Set-Cookie': clearSessionCookie({ secure: env.NODE_ENV !== 'development' })
		}
	})
}

import {
	errorResponse,
	jsonResponse,
	requireAdmin,
	listCalendarUsers
} from '../_helpers.js'

export async function onRequest({ env, request }) {
	if (request.method !== 'GET') {
		return errorResponse('Method not allowed', 405)
	}

	if (!await requireAdmin({ env, request })) {
		return errorResponse('Unauthorized', 401, 'unauthorized')
	}

	const users = await listCalendarUsers({ db: env.DB })

	return jsonResponse({ ok: true, users })
}

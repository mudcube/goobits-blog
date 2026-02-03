import {
	errorResponse,
	jsonResponse,
	requireAdmin,
	listRainbowUsers
} from '../_helpers.js'

export async function onRequest({ env, request }) {
	if (request.method !== 'GET') {
		return errorResponse('Method not allowed', 405)
	}

	if (!await requireAdmin({ env, request })) {
		return errorResponse('Unauthorized', 401, 'unauthorized')
	}

	const users = await listRainbowUsers({ db: env.DB })

	return jsonResponse({ ok: true, users })
}

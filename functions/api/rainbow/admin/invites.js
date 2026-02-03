import {
	errorResponse,
	jsonResponse,
	readJson,
	requireAdmin,
	createInvite,
	listInvites,
	deleteInvite
} from '../_helpers.js'

export async function onRequest({ env, request }) {
	if (!await requireAdmin({ env, request })) {
		return errorResponse('Unauthorized', 401, 'unauthorized')
	}

	if (request.method === 'GET') {
		const invites = await listInvites({ db: env.DB })
		return jsonResponse({ ok: true, invites })
	}

	if (request.method === 'POST') {
		const body = await readJson(request)
		if (body === null) {
			return errorResponse('Invalid JSON', 400, 'invalid_json')
		}
		const { email, uses, expiresInDays } = body

		const expiresAt = expiresInDays
			? Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60
			: null

		const invite = await createInvite({
			db: env.DB,
			email: email || null,
			usesRemaining: uses || 1,
			expiresAt
		})

		return jsonResponse({ ok: true, invite })
	}

	if (request.method === 'DELETE') {
		const url = new URL(request.url)
		const inviteId = url.searchParams.get('id')

		if (!inviteId) {
			return errorResponse('Missing invite id')
		}

		await deleteInvite({ db: env.DB, inviteId: Number(inviteId) })
		return jsonResponse({ ok: true })
	}

	return errorResponse('Method not allowed', 405)
}

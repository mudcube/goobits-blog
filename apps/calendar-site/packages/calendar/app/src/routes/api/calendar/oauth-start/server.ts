import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getGoogleAuthUrl, getOutlookAuthUrl } from '@calendar/core/providers'
import { createOauthState } from '@calendar/core/storage'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk } from '@calendar/kit'

async function startOAuth(event: RequestEvent) {
	return runApiRequest('calendar.oauth.start', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const body = event.request.method === 'POST'
			? ((await event.request.json().catch(() => null)) as { provider?: unknown } | null)
			: null
		const rawProvider = body?.provider ?? event.url.searchParams.get('provider') ?? 'google'
		const provider = rawProvider === 'outlook' ? 'outlook' : 'google'
		const env = await buildEnv(event.platform)
		const state = crypto.randomUUID()
		await createOauthState({ db: env.DB, state })
		const authUrl = provider === 'outlook'
			? getOutlookAuthUrl({ env, state })
			: getGoogleAuthUrl({ env, state })

		return apiOk({ authUrl, provider })
	}, { internalErrorMessage: 'Failed to start OAuth' })
}

export async function POST(event: RequestEvent) {
	return startOAuth(event)
}

export async function GET(event: RequestEvent) {
	return startOAuth(event)
}

import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { deleteConnection, getActiveCalendarSyncProvider, requireEnv, setActiveCalendarSyncProvider } from '@calendar/core'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk } from '@calendar/kit'

export function disconnectCalendarProvider(provider: 'google' | 'outlook' | 'apple', event: RequestEvent) {
	return runApiRequest(`admin.integrations.${provider}.disconnect`, async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const env = await buildEnv(event.platform)
		requireEnv(env, 'TOKEN_ENC_KEY')
		await deleteConnection({ db: env.DB, provider })
		if ((await getActiveCalendarSyncProvider(env.DB)) === provider) {
			await setActiveCalendarSyncProvider(env.DB, null)
		}
		logAdminEvent(event, 'integration_disconnect', { provider })
		return apiOk({})
	})
}

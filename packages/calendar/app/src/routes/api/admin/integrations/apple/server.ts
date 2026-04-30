import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { requireEnv, saveConnection, setActiveCalendarSyncProvider } from '@calendar/core'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiError, apiOk } from '@calendar/kit'

function readString(body: Record<string, unknown>, key: string, maxLength: number) {
	const raw = body[key]
	if (typeof raw !== 'string') return ''
	return raw.trim().slice(0, maxLength)
}

export async function PUT(event: RequestEvent) {
	return runApiRequest('admin.integrations.apple.connect', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const body = (await event.request.json().catch(() => null)) as Record<string, unknown> | null
		if (!body || typeof body !== 'object') return apiError('Invalid Apple Calendar settings', { status: 400 })
		const username = readString(body, 'username', 160)
		const appPassword = readString(body, 'appPassword', 160)
		const calendarUrl = readString(body, 'calendarUrl', 500)
		if (!username || !appPassword || !calendarUrl || !/^https:\/\//i.test(calendarUrl)) {
			return apiError('Apple username, app-specific password, and HTTPS CalDAV calendar URL are required', { status: 400 })
		}

		const env = await buildEnv(event.platform)
		await saveConnection({
			db: env.DB,
			provider: 'apple',
			base64Key: requireEnv(env, 'TOKEN_ENC_KEY'),
			token: {
				accessToken: username,
				refreshToken: appPassword,
				expiresAt: Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
				scope: calendarUrl
			}
		})
		await setActiveCalendarSyncProvider(env.DB, 'apple')
		logAdminEvent(event, 'integration_connect', { provider: 'apple' })
		return apiOk({})
	})
}

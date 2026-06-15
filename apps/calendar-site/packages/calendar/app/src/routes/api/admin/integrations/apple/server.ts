import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { requireEnv } from '@calendar/core/config'
import { saveConnection } from '@calendar/core/storage'
import { setActiveCalendarSyncProvider } from '@calendar/core/sync'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiError, apiOk } from '@calendar/kit'

function readString(body: Record<string, unknown>, key: string, maxLength: number) {
	const raw = body[key]
	if (typeof raw !== 'string') return ''
	return raw.trim().slice(0, maxLength)
}

function isPublicCalDavUrl(value: string): boolean {
	let url: URL
	try {
		url = new URL(value)
	} catch {
		return false
	}
	if (url.protocol !== 'https:') return false
	const host = url.hostname.toLowerCase()
	if (!host) return false
	// Reject loopback / link-local / unspecified hostnames
	if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return false
	// Reject IPv4 literals in private/loopback/link-local/CGNAT/metadata ranges
	const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
	if (ipv4) {
		const [, a, b] = ipv4
		const oct1 = Number(a)
		const oct2 = Number(b)
		if (oct1 === 10) return false
		if (oct1 === 127) return false
		if (oct1 === 0) return false
		if (oct1 === 169 && oct2 === 254) return false
		if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) return false
		if (oct1 === 192 && oct2 === 168) return false
		if (oct1 === 100 && oct2 >= 64 && oct2 <= 127) return false
		if (oct1 >= 224) return false
	}
	// Reject IPv6 literals
	if (host.startsWith('[')) return false
	// Reject bare hostnames (no dot) — must be a real FQDN
	if (!host.includes('.')) return false
	return true
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
		if (!username || !appPassword || !calendarUrl || !isPublicCalDavUrl(calendarUrl)) {
			return apiError('Apple username, app-specific password, and a public HTTPS CalDAV calendar URL are required', { status: 400 })
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

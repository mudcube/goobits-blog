import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import {
	ensureValidGoogleToken,
	ensureValidOutlookToken,
	getConnection,
	getActiveCalendarSyncProvider,
	saveConnection,
	requireEnv,
	getCalendarSyncQueueHealth,
	getAdminPaymentDefaults,
	getPaymentCheckoutConfig
} from '@calendar/core'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.status', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const env = await buildEnv(event.platform)
		const db = env.DB

		const base64Key = requireEnv(env, 'TOKEN_ENC_KEY')
		const storedActiveProvider = await getActiveCalendarSyncProvider(db)

		async function providerStatus(provider: 'google' | 'outlook' | 'apple') {
			let providerConnected = false
			let providerExpired = false
			let providerRefreshFailed = false
			let providerExpiresAt: number | null = null
			const connection = await getConnection({ db, provider, base64Key })
			if (connection) {
				providerConnected = true
				providerExpiresAt = connection.expiresAt ?? null
				providerExpired = provider === 'apple' ? false : !providerExpiresAt || Date.now() > providerExpiresAt
				if (providerExpired) {
					try {
						const next =
							provider === 'google'
								? await ensureValidGoogleToken({ env, token: connection })
								: await ensureValidOutlookToken({ env, token: connection })
						if (next.expiresAt !== connection.expiresAt || next.accessToken !== connection.accessToken) {
							await saveConnection({ db, provider, token: next, base64Key })
						}
						providerExpiresAt = next.expiresAt ?? null
						providerExpired = !providerExpiresAt || Date.now() > providerExpiresAt
					} catch (error) {
						providerRefreshFailed = true
						console.warn(`${provider} token refresh check failed in admin status:`, error)
					}
				}
			}
			return {
				connected: providerConnected,
				expired: providerExpired,
				expiresAt: providerExpiresAt,
				refreshFailed: providerRefreshFailed,
				active: false
			}
		}
		const providerStatuses = {
			google: await providerStatus('google'),
			outlook: await providerStatus('outlook'),
			apple: await providerStatus('apple')
		}
		const activeProvider =
			storedActiveProvider ??
			(providerStatuses.google.connected
				? 'google'
				: providerStatuses.outlook.connected
					? 'outlook'
					: providerStatuses.apple.connected
						? 'apple'
						: null)
		providerStatuses.google.active = activeProvider === 'google'
		providerStatuses.outlook.active = activeProvider === 'outlook'
		providerStatuses.apple.active = activeProvider === 'apple'

		// Get current rules from settings table, fallback to env
		const settingsRes = await db.prepare(
			`SELECT key, value FROM settings WHERE key IN ('hoursFrom', 'hoursTo', 'buffer', 'notice', 'capacity')`
		).all()

		const settings: Record<string, string> = {}
		for (const row of (settingsRes?.results ?? []) as Array<{ key: string; value: string }>) {
			settings[row.key] = row.value
		}
		const envValue = (key: string, fallback: string) => {
			const raw = env[key]
			return typeof raw === 'string' ? raw : fallback
		}

		const rules = {
			hoursFrom: settings['hoursFrom'] || envValue('BOOKING_HOURS_FROM', '06:00'),
			hoursTo: settings['hoursTo'] || envValue('BOOKING_HOURS_TO', '22:00'),
			buffer: parseInt(settings['buffer'] || envValue('BOOKING_BUFFER_MINUTES', '15'), 10),
			notice: parseInt(settings['notice'] || envValue('BOOKING_MIN_NOTICE_HOURS', '24'), 10),
			capacity: parseInt(settings['capacity'] || envValue('BOOKING_CAPACITY', '4'), 10)
		}
		const [syncQueue, paymentDefaults, paymentIntegrations] = await Promise.all([
			getCalendarSyncQueueHealth(db),
			getAdminPaymentDefaults(db),
			getPaymentCheckoutConfig({ db, env, base64Key })
		])

		const baseUrl =
			(typeof env['PUBLIC_BASE_URL'] === 'string' && env['PUBLIC_BASE_URL']) ||
			(typeof env['BASE_URL'] === 'string' && env['BASE_URL']) ||
			event.url.origin
		const normalize = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value)

		return apiOk({
			google: {
				connected: providerStatuses.google.connected,
				expired: providerStatuses.google.expired,
				expiresAt: providerStatuses.google.expiresAt,
				refreshFailed: providerStatuses.google.refreshFailed
			},
			sync: {
				activeProvider,
				providers: providerStatuses
			},
			oauth: {
				googleCalendarRedirectUri:
					typeof env['GOOGLE_REDIRECT_URI'] === 'string' ? normalize(env['GOOGLE_REDIRECT_URI']) : null,
				outlookRedirectUri:
					typeof env['OUTLOOK_REDIRECT_URI'] === 'string' ? normalize(env['OUTLOOK_REDIRECT_URI']) : null,
				googleLoginRedirectUri:
					typeof env['GOOGLE_AUTH_REDIRECT_URI'] === 'string'
						? normalize(env['GOOGLE_AUTH_REDIRECT_URI'])
						: normalize(`${baseUrl}/auth/google/callback`),
				appleLoginRedirectUri:
					typeof env['APPLE_AUTH_REDIRECT_URI'] === 'string'
						? normalize(env['APPLE_AUTH_REDIRECT_URI'])
						: normalize(`${baseUrl}/auth/apple/callback`)
			},
			syncQueue,
			rules,
			paymentDefaults,
			paymentIntegrations
		})
	})
}

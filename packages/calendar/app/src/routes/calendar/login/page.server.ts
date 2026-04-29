import { dev } from '$app/environment'
import { getCalendarConfig, validateInvite } from '@calendar/core'
import { buildEnv, getCalendarLoginContext, normalizeCalendarRedirect } from '@calendar/kit'
import type { RequestEvent } from '@sveltejs/kit'

type CalendarAuthEnv = {
	GOOGLE_CLIENT_ID?: string
	GOOGLE_CLIENT_SECRET?: string
	APPLE_CLIENT_ID?: string
	APPLE_TEAM_ID?: string
	APPLE_KEY_ID?: string
	APPLE_PRIVATE_KEY?: string
	[key: string]: string | undefined
}

function mergeAuthEnv(platformEnv?: CalendarAuthEnv) {
	return {
		...Object.fromEntries(Object.entries(process.env).filter(([, value]) => typeof value === 'string')),
		...(platformEnv ?? {})
	} as Record<string, string | undefined>
}

function resolveCalendarProviders(env: Record<string, string | undefined>) {
	return {
		google: Boolean(env['GOOGLE_CLIENT_ID'] && env['GOOGLE_CLIENT_SECRET']),
		apple: Boolean(env['APPLE_CLIENT_ID'] && env['APPLE_TEAM_ID'] && env['APPLE_KEY_ID'] && env['APPLE_PRIVATE_KEY'])
	}
}

export const load = async ({ cookies, platform, url }: RequestEvent) => {
	const env = mergeAuthEnv(platform?.env as Record<string, string | undefined> | undefined)
	const providers = resolveCalendarProviders(env)
	const loginContext = getCalendarLoginContext(cookies)
	const inviteCode = (url.searchParams.get('invite') || loginContext.invite || '').trim()
	const redirectTo =
		normalizeCalendarRedirect(url.searchParams.get('redirect')) ||
		loginContext.redirectTo ||
		getCalendarConfig().routes.calendarBase
	let inviteStatus: 'valid' | 'expired' | 'exhausted' | 'not_found' | 'email_mismatch' | 'missing_code' | null = null
	let inviteEmailRestricted = false

	if (inviteCode) {
		const runtimeEnv = await buildEnv(platform)
		const result = await validateInvite({
			db: runtimeEnv.DB,
			code: inviteCode
		})
		if (result.valid) {
			inviteStatus = 'valid'
			inviteEmailRestricted = !!result.invite?.email
		} else {
			switch (result.reason) {
				case 'expired':
				case 'exhausted':
				case 'not_found':
				case 'email_mismatch':
				case 'missing_code':
					inviteStatus = result.reason
					break
				default:
					inviteStatus = 'not_found'
			}
		}
	}

	// In local development, keep at least Google button available when configured.
	return {
		providers,
		hasAnyProvider: providers.google || providers.apple,
		isDev: dev,
		inviteCode,
		inviteStatus,
		inviteEmailRestricted,
		redirectTo
	}
}

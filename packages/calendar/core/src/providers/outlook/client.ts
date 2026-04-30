import { getEnv, requireEnv } from '../../config/env.ts'

type OutlookEnv = Record<string, unknown> | null | undefined

export const OUTLOOK_SCOPES = [
	'offline_access',
	'https://graph.microsoft.com/Calendars.ReadWrite'
]

function normalizeRedirectUri(value: string) {
	return value.endsWith('/') ? value.slice(0, -1) : value
}

export function getOutlookConfig(env: OutlookEnv) {
	return {
		tenant: getEnv(env, 'OUTLOOK_TENANT_ID', 'common') || 'common',
		clientId: requireEnv(env, 'OUTLOOK_CLIENT_ID'),
		clientSecret: requireEnv(env, 'OUTLOOK_CLIENT_SECRET'),
		redirectUri: normalizeRedirectUri(requireEnv(env, 'OUTLOOK_REDIRECT_URI')),
		calendarId: getEnv(env, 'OUTLOOK_CALENDAR_ID', '')?.trim() || null
	}
}

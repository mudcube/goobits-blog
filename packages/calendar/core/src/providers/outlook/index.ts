import { getOutlookConfig, OUTLOOK_SCOPES } from './client.ts'
import {
	buildOutlookAuthUrl,
	exchangeOutlookCodeForTokens,
	isOutlookTokenExpired,
	refreshOutlookAccessToken,
	type NormalizedOutlookToken
} from './oauth.ts'
import { createOutlookEvent, deleteOutlookEvent, type OutlookCalendarEventInput } from './events.ts'

export function getOutlookAuthUrl({
	env,
	state,
	scopes = OUTLOOK_SCOPES
}: {
	env: Record<string, unknown>
	state: string
	scopes?: string[]
}) {
	const { tenant, clientId, redirectUri } = getOutlookConfig(env)
	return buildOutlookAuthUrl({ tenant, clientId, redirectUri, scopes, state })
}

export async function exchangeOutlookCode({
	env,
	code,
	scopes = OUTLOOK_SCOPES
}: {
	env: Record<string, unknown>
	code: string
	scopes?: string[]
}) {
	const { tenant, clientId, clientSecret, redirectUri } = getOutlookConfig(env)
	return exchangeOutlookCodeForTokens({ tenant, clientId, clientSecret, redirectUri, code, scopes })
}

export async function ensureValidOutlookToken({
	env,
	token,
	scopes = OUTLOOK_SCOPES
}: {
	env: Record<string, unknown>
	token: NormalizedOutlookToken
	scopes?: string[]
}) {
	if (!isOutlookTokenExpired(token)) return token
	const { tenant, clientId, clientSecret } = getOutlookConfig(env)
	return refreshOutlookAccessToken({ tenant, clientId, clientSecret, refreshToken: token.refreshToken, scopes })
}

export async function outlookCreateEvent({
	accessToken,
	env,
	event
}: {
	accessToken: string
	env: Record<string, unknown>
	event: OutlookCalendarEventInput
}) {
	const { calendarId } = getOutlookConfig(env)
	return createOutlookEvent({ accessToken, calendarId, event })
}

export const outlookDeleteEvent = deleteOutlookEvent
export { OUTLOOK_SCOPES }

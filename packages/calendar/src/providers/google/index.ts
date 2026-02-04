import { getGoogleConfig } from './client.ts'
import { buildAuthUrl, exchangeCodeForTokens, refreshAccessToken } from './oauth.ts'
import { getFreeBusy } from './freebusy.ts'
import { createEvent, deleteEvent } from './events.ts'
import { isTokenExpired, normalizeTokenResponse } from './tokens.ts'

const DEFAULT_SCOPES = [
	'https://www.googleapis.com/auth/calendar.events',
	'https://www.googleapis.com/auth/calendar.readonly'
]

export function getGoogleAuthUrl({
	env,
	state,
	scopes = DEFAULT_SCOPES
}: {
	env: Record<string, any>
	state: string
	scopes?: string[]
}) {
	const { clientId, redirectUri } = getGoogleConfig(env)
	return buildAuthUrl({ clientId, redirectUri, scopes, state })
}

export async function exchangeGoogleCode({
	env,
	code
}: {
	env: Record<string, any>
	code: string
}) {
	const { clientId, clientSecret, redirectUri } = getGoogleConfig(env)
	const tokenResponse = await exchangeCodeForTokens({ clientId, clientSecret, redirectUri, code })
	return normalizeTokenResponse(tokenResponse)
}

export async function refreshGoogleToken({
	env,
	refreshToken
}: {
	env: Record<string, any>
	refreshToken: string
}) {
	const { clientId, clientSecret } = getGoogleConfig(env)
	const tokenResponse = await refreshAccessToken({ clientId, clientSecret, refreshToken })
	return normalizeTokenResponse(tokenResponse, refreshToken)
}

export async function ensureValidGoogleToken({
	env,
	token
}: {
	env: Record<string, any>
	token: any
}) {
	if (!isTokenExpired(token)) return token
	return refreshGoogleToken({ env, refreshToken: token.refreshToken })
}

export async function googleFreeBusy({
	accessToken,
	timeMin,
	timeMax,
	calendarIds
}: {
	accessToken: string
	timeMin: string
	timeMax: string
	calendarIds: string[]
}) {
	return getFreeBusy({ accessToken, timeMin, timeMax, calendarIds })
}

export async function googleCreateEvent({
	accessToken,
	calendarId,
	event
}: {
	accessToken: string
	calendarId: string
	event: any
}) {
	return createEvent({ accessToken, calendarId, event })
}

export async function googleDeleteEvent({
	accessToken,
	calendarId,
	eventId
}: {
	accessToken: string
	calendarId: string
	eventId: string
}) {
	return deleteEvent({ accessToken, calendarId, eventId })
}

export { DEFAULT_SCOPES }

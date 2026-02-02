import { getGoogleConfig } from './client.js'
import { buildAuthUrl, exchangeCodeForTokens, refreshAccessToken } from './oauth.js'
import { getFreeBusy } from './freebusy.js'
import { createEvent, deleteEvent } from './events.js'
import { isTokenExpired, normalizeTokenResponse } from './tokens.js'

const DEFAULT_SCOPES = [
	'https://www.googleapis.com/auth/calendar.events',
	'https://www.googleapis.com/auth/calendar.readonly'
]

export function getGoogleAuthUrl({ env, state, scopes = DEFAULT_SCOPES }) {
	const { clientId, redirectUri } = getGoogleConfig(env)
	return buildAuthUrl({ clientId, redirectUri, scopes, state })
}

export async function exchangeGoogleCode({ env, code }) {
	const { clientId, clientSecret, redirectUri } = getGoogleConfig(env)
	const tokenResponse = await exchangeCodeForTokens({ clientId, clientSecret, redirectUri, code })
	return normalizeTokenResponse(tokenResponse)
}

export async function refreshGoogleToken({ env, refreshToken }) {
	const { clientId, clientSecret } = getGoogleConfig(env)
	const tokenResponse = await refreshAccessToken({ clientId, clientSecret, refreshToken })
	return normalizeTokenResponse(tokenResponse, refreshToken)
}

export async function ensureValidGoogleToken({ env, token }) {
	if (!isTokenExpired(token)) return token
	return refreshGoogleToken({ env, refreshToken: token.refreshToken })
}

export async function googleFreeBusy({ accessToken, timeMin, timeMax, calendarIds }) {
	return getFreeBusy({ accessToken, timeMin, timeMax, calendarIds })
}

export async function googleCreateEvent({ accessToken, calendarId, event }) {
	return createEvent({ accessToken, calendarId, event })
}

export async function googleDeleteEvent({ accessToken, calendarId, eventId }) {
	return deleteEvent({ accessToken, calendarId, eventId })
}

export { DEFAULT_SCOPES }

import { getCalendarAuth, setCalendarLoginContext } from '../../../server/auth/calendar'
import {
	buildCalendarLoginErrorPath,
	getRedirectLocationFromError,
	hasValidOAuthCallbackParams,
	isStatusError,
	resolveCallbackProvider,
	resolveRequestedProvider,
	shouldWrapAsOauthFailure
} from '@calendar/app/oauth-routing'
import { dev } from '$app/environment'
import type { RequestHandler } from '@sveltejs/kit'

function logProviderRedirectDiagnostics({
	provider,
	location
}: {
	provider: string
	location: string
}) {
	if (!dev) return
	if (!location.startsWith('https://accounts.google.com/o/oauth2/v2/auth')) return

	const authUrl = new URL(location)
	const redirectUri = authUrl.searchParams.get('redirect_uri') || ''
	const clientId = authUrl.searchParams.get('client_id') || ''
	console.info('[auth oauth debug] provider redirect', {
		provider,
		clientId,
		redirectUri
	})
}

function redirectResponse(status: number, location: string) {
	return new Response(null, {
		status,
		headers: {
			location
		}
	})
}

export const GET: RequestHandler = async (event) => {
	const { auth, secureCookies } = await getCalendarAuth({ event })

	// Set invite/redirect cookies on signin routes (e.g. /auth/google)
	const invite = event.url.searchParams.get('invite') || null
	const redirectTo = event.url.searchParams.get('redirect') || null
	if (invite || redirectTo) {
		const context: { invite?: string; redirectTo?: string; secure: boolean } = { secure: secureCookies }
		if (invite) context.invite = invite
		if (redirectTo) context.redirectTo = redirectTo
		setCalendarLoginContext(event.cookies, {
			...context
		})
	}

	const requestedProvider = resolveRequestedProvider(event.url.pathname)
	if (requestedProvider) {
		const providers = auth?.providers ?? {}
		if (!(requestedProvider in providers)) {
			return redirectResponse(302, buildCalendarLoginErrorPath(`${requestedProvider}_not_enabled`))
		}
	}

	const callbackProvider = resolveCallbackProvider(event.url.pathname)
	if (callbackProvider) {
		if (!hasValidOAuthCallbackParams({
			url: event.url,
			cookies: event.cookies,
			provider: callbackProvider
		})) {
			return redirectResponse(302, buildCalendarLoginErrorPath('oauth_state_invalid'))
		}
	}

	try {
		const response = await auth.handlers.GET(event)
		if (callbackProvider && response.status >= 400) {
			return redirectResponse(302, buildCalendarLoginErrorPath('oauth_failed'))
		}
		if (requestedProvider) {
			logProviderRedirectDiagnostics({
				provider: requestedProvider,
				location: response.headers.get('location') || ''
			})
		}
		return response
	} catch (error) {
		if (isStatusError(error) && error.status >= 300 && error.status < 400) {
			const location = getRedirectLocationFromError(error)
			if (requestedProvider) {
				logProviderRedirectDiagnostics({
					provider: requestedProvider,
					location
				})
			}
			return redirectResponse(error.status, location)
		}

		if (callbackProvider && shouldWrapAsOauthFailure(error)) {
			console.error('[auth oauth callback] unexpected failure', error)
			return redirectResponse(302, buildCalendarLoginErrorPath('oauth_failed'))
		}
		throw error
	}
}

export const POST: RequestHandler = async (event) => {
	const { auth } = await getCalendarAuth({ event })
	try {
		return await auth.handlers.POST(event)
	} catch (error) {
		if (isStatusError(error) && error.status >= 300 && error.status < 400) {
			return redirectResponse(error.status, getRedirectLocationFromError(error))
		}
		throw error
	}
}

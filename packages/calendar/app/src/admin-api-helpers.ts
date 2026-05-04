import type { RequestEvent } from '@sveltejs/kit'
import { apiError, logApiError, noStoreHeaders as sharedNoStoreHeaders } from '@calendar/kit'

export const noStoreHeaders = sharedNoStoreHeaders

export function requireAdminSession({ event }: { event: RequestEvent }) {
	const locals = event.locals as { user?: unknown; session?: unknown; calendarAdmin?: boolean }
	return { ok: !!(locals.session && locals.user && locals.calendarAdmin) }
}

export function unauthorized() {
	return apiError('Unauthorized', { status: 401 })
}

export function forbidden() {
	return apiError('Forbidden', { status: 403 })
}

function isSameOrigin(event: RequestEvent) {
	const fetchSite = event.request.headers.get('sec-fetch-site')
	if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site' && fetchSite !== 'none') {
		return false
	}

	const origin = event.request.headers.get('origin')
	if (origin) return origin === event.url.origin

	const referer = event.request.headers.get('referer')
	if (referer) {
		try {
			return new URL(referer).origin === event.url.origin
		} catch {
			return false
		}
	}

	return false
}

export function enforceSameOrigin(event: RequestEvent) {
	if (!isSameOrigin(event)) {
		return forbidden()
	}
	return null
}

export function logAdminEvent(event: RequestEvent, action: string, meta: Record<string, unknown> = {}) {
	const ip =
		event.getClientAddress?.() ||
		event.request?.headers?.get('cf-connecting-ip') ||
		event.request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		'unknown'
	console.info(`[admin] ${action}`, { ip, ...meta })
}

export function requireAdminRequest(event: RequestEvent, options: { csrf?: boolean } = {}) {
	if (options.csrf) {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf
	}
	const auth = requireAdminSession({ event })
	if (!auth.ok) return unauthorized()
	return null
}

export async function runApiRequest(
	scope: string,
	handler: () => Promise<Response>,
	options: {
		onError?: (error: unknown) => Response | null
		internalErrorMessage?: string
	} = {}
) {
	try {
		return await handler()
	} catch (error) {
		const mapped = options.onError?.(error) ?? null
		if (mapped) return mapped
		logApiError(scope, error)
		return apiError(options.internalErrorMessage ?? 'Internal server error')
	}
}

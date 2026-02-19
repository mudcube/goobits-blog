import type { RequestEvent } from '@sveltejs/kit'
import { apiError, logApiError } from './api'

type CalendarLocals = {
	user?: {
		id?: string | number
		[key: string]: unknown
	}
}

export function getCalendarUserId(event: RequestEvent) {
	const locals = event.locals as CalendarLocals
	const id = locals.user?.id
	if (typeof id === 'string') return id
	if (typeof id === 'number') return String(id)
	return null
}

export function unauthorizedCalendar() {
	return apiError('Unauthorized', { status: 401 })
}

export function requireCalendarUserId(event: RequestEvent) {
	const userId = getCalendarUserId(event)
	if (!userId) {
		return { userId: null, response: unauthorizedCalendar() }
	}
	return { userId, response: null }
}

export async function runCalendarRequest(
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

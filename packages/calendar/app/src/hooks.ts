import { redirect } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'
import { getAdminAuth, getCalendarAuth } from '@calendar/kit'

export type CalendarAppHookConfig = {
	adminBase?: string
	apiAdminBase?: string
	apiCalendarAdminBase?: string
	calendarBase?: string
	apiCalendarBase?: string
	authBase?: string
	calendarLoginPath?: string
	calendarLoginRedirectPath?: string
}

export function createCalendarAuthHandles(config: CalendarAppHookConfig = {}) {
	const adminBase = config.adminBase ?? '/admin'
	const apiAdminBase = config.apiAdminBase ?? '/api/admin'
	const apiCalendarAdminBase = config.apiCalendarAdminBase ?? '/api/calendar/admin'
	const calendarBase = config.calendarBase ?? '/calendar'
	const apiCalendarBase = config.apiCalendarBase ?? '/api/calendar'
	const authBase = config.authBase ?? '/auth'
	const calendarLoginPath = config.calendarLoginPath ?? '/calendar/login'
	const calendarLoginRedirectPath = config.calendarLoginRedirectPath ?? '/calendar/login/redirect'

	const handleAdminAuth: Handle = async ({ event, resolve }) => {
		const pathname = event.url.pathname

		if (
			!pathname.startsWith(adminBase) &&
			!pathname.startsWith(apiAdminBase) &&
			!pathname.startsWith(apiCalendarAdminBase)
		) {
			return resolve(event)
		}

		try {
			const { auth } = await getAdminAuth({ event })
			return auth.handle()({ event, resolve })
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error) {
				throw error
			}
			console.error('[admin-auth] unavailable', error)
			if (pathname.startsWith(adminBase)) {
				;(event.locals as { user?: unknown }).user = undefined
				return resolve(event)
			}
			return new Response('Admin auth unavailable', { status: 503 })
		}
	}

	const handleCalendarAuth: Handle = async ({ event, resolve }) => {
		const pathname = event.url.pathname
		if (!pathname.startsWith(calendarBase) && !pathname.startsWith(apiCalendarBase) && !pathname.startsWith(authBase)) {
			return resolve(event)
		}

		const { auth } = await getCalendarAuth({ event })
		return auth.handle()({ event, resolve })
	}

	const requireCalendarUser: Handle = async ({ event, resolve }) => {
		const pathname = event.url.pathname

		if (!pathname.startsWith(calendarBase)) {
			return resolve(event)
		}

		if (
			pathname === calendarLoginPath ||
			pathname === `${calendarLoginPath}/` ||
			pathname === calendarLoginRedirectPath ||
			pathname === `${calendarLoginRedirectPath}/` ||
			pathname.startsWith(apiCalendarBase)
		) {
			return resolve(event)
		}

		const locals = event.locals as { user?: unknown }
		if (!locals.user) {
			const redirectTo = encodeURIComponent(pathname)
			redirect(302, `${calendarLoginPath}?redirect=${redirectTo}`)
		}

		return resolve(event)
	}

	return {
		handleAdminAuth,
		handleCalendarAuth,
		requireCalendarUser
	}
}

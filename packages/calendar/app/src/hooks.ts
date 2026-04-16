import { redirect } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'
import { dev } from '$app/environment'
import { getAdminAuth, getCalendarAuth } from '@calendar/kit'
import { getCalendarConfig, type CalendarConfigInput } from '@calendar/core'
import { buildEnv } from '@calendar/kit'
import { ensureCalendarUserByEmail, setCalendarSessionCookie } from './server/auth/calendar-session'

async function tryBootstrapDevCalendarSession(event: Parameters<Handle>[0]['event']) {
	if (!dev) return false

	const requestUrl = new URL(event.request.url)
	const previewFlag = requestUrl.searchParams.get('preview')
	if (previewFlag !== '1') return false

	const env = await buildEnv(event.platform)
	if (env['NODE_ENV'] !== 'development') return false

	const email = (requestUrl.searchParams.get('previewEmail') || 'preview-user@local.dev').trim().toLowerCase()
	const name = (requestUrl.searchParams.get('previewName') || 'Preview User').trim()
	const user = await ensureCalendarUserByEmail({
		db: env.DB,
		email,
		name: name || 'Preview User',
		emailVerified: true
	})
	if (!user.ok) return false

	await setCalendarSessionCookie({
		db: env.DB,
		cookies: event.cookies,
		secureCookies: false,
		userId: String(user.userId)
	})
	return true
}

export type CalendarAppHookConfig = CalendarConfigInput['routes']

export function createCalendarAuthHandles(config: CalendarAppHookConfig = {}) {
	const routes = { ...getCalendarConfig().routes, ...config }
	const adminBase = routes.adminBase
	const apiAdminBase = routes.apiAdminBase
	const apiCalendarAdminBase = routes.apiCalendarAdminBase
	const calendarBase = routes.calendarBase
	const apiCalendarBase = routes.apiCalendarBase
	const authBase = routes.authBase
	const calendarLoginPath = routes.calendarLoginPath
	const calendarLoginRedirectPath = routes.calendarLoginRedirectPath

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
		if (
			pathname.startsWith(apiCalendarAdminBase) ||
			(!pathname.startsWith(calendarBase) && !pathname.startsWith(apiCalendarBase) && !pathname.startsWith(authBase))
		) {
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
		if (dev && event.url.searchParams.get('mock') === '1') {
			if (!locals.user) {
				locals.user = {
					id: '0',
					email: 'mock-user@local.dev',
					name: 'Mock User',
					avatar_url: null,
					emailVerified: true
				}
			}
			return resolve(event)
		}

		if (!locals.user) {
			const bootstrapped = await tryBootstrapDevCalendarSession(event)
			if (bootstrapped) {
				const next = new URL(event.url)
				next.searchParams.delete('preview')
				next.searchParams.delete('previewEmail')
				next.searchParams.delete('previewName')
				throw redirect(302, `${next.pathname}${next.search}`)
			}

			const redirectTo = encodeURIComponent(pathname)
			throw redirect(302, `${calendarLoginPath}?redirect=${redirectTo}`)
		}

		return resolve(event)
	}

	return {
		handleAdminAuth,
		handleCalendarAuth,
		requireCalendarUser
	}
}

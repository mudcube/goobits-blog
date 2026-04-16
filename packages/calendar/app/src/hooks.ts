import { redirect } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'
import { dev } from '$app/environment'
import { getAdminAuth, getCalendarAuth } from '@calendar/kit'
import { getCalendarConfig, type CalendarConfigInput } from '@calendar/core'
import { buildEnv } from '@calendar/kit'
import { D1SessionAdapter } from '@goobits/auth/adapters'

type CalendarUserRow = { id: string | number }

async function tryBootstrapDevCalendarSession(event: Parameters<Handle>[0]['event']) {
	if (!dev) return false

	const requestUrl = new URL(event.request.url)
	const previewFlag = requestUrl.searchParams.get('preview')
	if (previewFlag !== '1') return false

	const env = await buildEnv(event.platform)
	if (env['NODE_ENV'] !== 'development') return false

	const email = (requestUrl.searchParams.get('previewEmail') || 'preview-user@local.dev').trim().toLowerCase()
	const name = (requestUrl.searchParams.get('previewName') || 'Preview User').trim()

	const existing = await env.DB.prepare(
		`SELECT id FROM calendar_users WHERE lower(email) = lower(?) LIMIT 1`
	).bind(email).first<CalendarUserRow>()

	let userId = existing?.id
	if (!userId) {
		const inserted = await env.DB.prepare(
			`INSERT INTO calendar_users (email, name, email_verified, created_at, last_login_at)
			 VALUES (?, ?, 1, unixepoch(), unixepoch())`
		).bind(email, name || 'Preview User').run()
		userId = inserted.meta.last_row_id
	} else {
		await env.DB.prepare(
			`UPDATE calendar_users SET last_login_at = unixepoch() WHERE id = ?`
		).bind(userId).run()
	}

	const sessionAdapter = new D1SessionAdapter(env.DB, {
		sessionsTable: 'calendar_sessions',
		usersTable: 'calendar_users',
		cookieName: 'calendar_session',
		secureCookies: false,
		sessionLifetime: 7 * 24 * 60 * 60 * 1000,
		userColumns: {
			id: 'id',
			email: 'email',
			name: 'name',
			avatar: 'avatar_url',
			password: 'password',
			emailVerified: 'email_verified'
		}
	})

	const session = await sessionAdapter.createSession(String(userId))
	sessionAdapter.setSessionCookie(event.cookies, session)
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

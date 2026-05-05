import { getAdminViewSettings, getCalendarConfig, getDefaultAdminViewSettings, type AdminViewSettings } from '@calendar/core'
import { buildEnv } from '@calendar/kit'
import { redirect } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'

export const prerender = false

function adminRootWithContext(url: URL) {
	const config = getCalendarConfig()
	const next = new URL(`${config.routes.adminBase}/`, url)
	if (url.searchParams.get('mock') === '1') {
		next.searchParams.set('mock', '1')
	}
	return `${next.pathname}${next.search}`
}

function readAdminUserId(user: unknown): number | null {
	if (!user || typeof user !== 'object') return null
	const raw = (user as { id?: unknown }).id
	if (typeof raw === 'number' && Number.isFinite(raw)) return raw
	if (typeof raw === 'string') {
		const parsed = Number.parseInt(raw, 10)
		if (Number.isFinite(parsed)) return parsed
	}
	return null
}

export async function load(event: RequestEvent) {
	const config = getCalendarConfig()
	const locals = event.locals as { user?: unknown; calendarAdmin?: boolean }
	const user = locals.calendarAdmin ? (locals.user ?? null) : null
	const isAdminRoot =
		event.url.pathname === config.routes.adminBase ||
		event.url.pathname === `${config.routes.adminBase}/`
	if (!user && !isAdminRoot) {
		throw redirect(302, adminRootWithContext(event.url))
	}

	let viewSettings: AdminViewSettings = getDefaultAdminViewSettings()
	const userId = readAdminUserId(user)
	if (userId != null) {
		try {
			const env = await buildEnv(event.platform)
			viewSettings = await getAdminViewSettings(env.DB, userId)
		} catch (error) {
			console.warn('[admin-layout] failed to load view settings:', error)
		}
	}

	return { user, viewSettings }
}

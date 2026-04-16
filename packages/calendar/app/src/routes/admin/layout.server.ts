import { getCalendarConfig } from '@calendar/core'
import { redirect } from '@sveltejs/kit'

export const prerender = false

function adminRootWithContext(url: URL) {
	const config = getCalendarConfig()
	const next = new URL(`${config.routes.adminBase}/`, url)
	if (url.searchParams.get('mock') === '1') {
		next.searchParams.set('mock', '1')
	}
	return `${next.pathname}${next.search}`
}

export function load(event: { locals: { user?: unknown }; url: URL }) {
	const config = getCalendarConfig()
	const user = event.locals.user ?? null
	const isAdminRoot =
		event.url.pathname === config.routes.adminBase ||
		event.url.pathname === `${config.routes.adminBase}/`
	if (!user && !isAdminRoot) {
		redirect(302, adminRootWithContext(event.url))
	}
	return { user }
}

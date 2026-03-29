import { redirect } from '@sveltejs/kit'

export const prerender = false

export function load(event: { locals: { user?: unknown }; url: URL }) {
	const user = event.locals.user ?? null
	const isAdminRoot = event.url.pathname === '/schedule/admin' || event.url.pathname === '/schedule/admin/'
	if (!user && !isAdminRoot) {
		redirect(302, '/schedule/admin/')
	}
	return { user }
}

import { redirect } from '@sveltejs/kit'

export const prerender = false

export function load(event: { locals: { user?: unknown }; url: URL }) {
	const user = event.locals.user ?? null
	const isAdminRoot = event.url.pathname === '/admin' || event.url.pathname === '/admin/'
	if (!user && !isAdminRoot) {
		redirect(302, '/admin')
	}
	return { user }
}

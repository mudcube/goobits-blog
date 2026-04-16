import { redirect } from '@sveltejs/kit'

export const prerender = false

function adminRootWithContext(url: URL) {
	const next = new URL('/schedule/admin/', url)
	if (url.searchParams.get('mock') === '1') {
		next.searchParams.set('mock', '1')
	}
	return `${next.pathname}${next.search}`
}

export function load(event: { locals: { user?: unknown }; url: URL }) {
	const user = event.locals.user ?? null
	const isAdminRoot = event.url.pathname === '/schedule/admin' || event.url.pathname === '/schedule/admin/'
	if (!user && !isAdminRoot) {
		redirect(302, adminRootWithContext(event.url))
	}
	return { user }
}

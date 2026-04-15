import { redirect } from '@sveltejs/kit'

export const prerender = false

export function GET() {
	throw redirect(308, '/journal/rss.xml')
}

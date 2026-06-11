import { redirect } from '@sveltejs/kit'
import { buildCalendarRedirectUrl } from '$lib/app/calendar-redirect'
import type { RequestHandler } from './$types'

export const prerender = false

export const GET: RequestHandler = ({ platform, url }) => {
	redirect(302, buildCalendarRedirectUrl(url.pathname, url.search, platform?.env))
}

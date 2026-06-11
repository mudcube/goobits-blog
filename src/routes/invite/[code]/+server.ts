import { redirect } from '@sveltejs/kit'
import { buildCalendarRedirectUrl } from '$lib/app/calendar-redirect'
import type { RequestHandler } from './$types'

export const prerender = false

export const GET: RequestHandler = ({ params, platform }) => {
	const search = `?invite=${encodeURIComponent(params.code)}`
	redirect(302, buildCalendarRedirectUrl('/schedule/login/', search, platform?.env))
}

import { redirect } from '@sveltejs/kit'
import { getCalendarRedirect } from '@miko/calendar-kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ cookies }) => {
	const redirectTo = getCalendarRedirect(cookies) || '/calendar'
	redirect(302, redirectTo)
}

import { redirect } from '@sveltejs/kit'
import { getCalendarRedirect } from '@calendar/kit'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = ({ cookies }) => {
	const redirectTo = getCalendarRedirect(cookies) || '/calendar'
	redirect(302, redirectTo)
}

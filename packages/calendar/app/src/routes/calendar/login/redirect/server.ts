import { redirect } from '@sveltejs/kit'
import { getCalendarRedirect } from '@calendar/kit'
import { getCalendarConfig } from '@calendar/core'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = ({ cookies }) => {
	const redirectTo = getCalendarRedirect(cookies) || getCalendarConfig().routes.calendarBase
	redirect(302, redirectTo)
}

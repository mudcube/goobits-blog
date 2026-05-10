import { redirect } from '@sveltejs/kit'
import { getCalendarRedirect } from '../../../../server/auth/calendar'
import { getCalendarConfig } from '@calendar/core'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = ({ cookies }) => {
	const redirectTo = getCalendarRedirect(cookies) || getCalendarConfig().routes.calendarBase
	throw redirect(302, redirectTo)
}

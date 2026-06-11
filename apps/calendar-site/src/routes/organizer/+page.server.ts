import { redirect } from '@sveltejs/kit'
import { buildEnv, getCalendarUserId } from '@calendar/kit'
import { ensureCalendarCreatorTenant, listCalendarTenantOrganizerEvents } from '@calendar/core/tenants'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	const userId = getCalendarUserId(event)
	if (!userId) throw redirect(303, `/login?redirect=${encodeURIComponent('/organizer')}`)

	const env = await buildEnv(event.platform)
	const tenant = await ensureCalendarCreatorTenant(env.DB, { userId })
	const events = await listCalendarTenantOrganizerEvents(env.DB, {
		tenantId: tenant.id
	})
	const now = Date.now()
	const upcomingCount = events.filter((entry) => new Date(entry.endsAt).getTime() >= now).length

	return {
		tenant,
		events,
		isAdmin: (event.locals as { calendarAdmin?: boolean }).calendarAdmin === true,
		stats: {
			totalEvents: events.length,
			upcomingEvents: upcomingCount,
			seatsTaken: events.reduce((sum, entry) => sum + entry.seatsTaken, 0),
			waitlistCount: events.reduce((sum, entry) => sum + entry.waitlistCount, 0)
		}
	}
}

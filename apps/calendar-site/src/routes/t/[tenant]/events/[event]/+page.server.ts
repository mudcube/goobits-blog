import { error } from '@sveltejs/kit'
import { buildEnv, getCalendarUserId } from '@calendar/kit'
import { getEventMutationState } from '@calendar/core/booking'
import { getCalendarTenantBySlug, getPublicCalendarTenantEvent } from '@calendar/core/tenants'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	const eventId = Number.parseInt(event.params.event, 10)
	if (!Number.isFinite(eventId) || eventId <= 0) throw error(404, 'Event not found')

	const env = await buildEnv(event.platform)
	const tenant = await getCalendarTenantBySlug(env.DB, event.params.tenant)
	if (!tenant || tenant.visibility !== 'public') throw error(404, 'Organizer not found')

	const publicEvent = await getPublicCalendarTenantEvent(env.DB, {
		tenantId: tenant.id,
		eventId
	})
	if (!publicEvent) throw error(404, 'Event not found')

	const userId = getCalendarUserId(event)
	const state = userId ? await getEventMutationState(env.DB, { eventId, userId }) : null
	const eventPath = `/t/${tenant.slug}/events/${publicEvent.id}`

	return {
		tenant,
		event: publicEvent,
		state,
		isSignedIn: Boolean(userId),
		loginUrl: `/login?redirect=${encodeURIComponent(eventPath)}`
	}
}

import { error } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getCalendarTenantBySlug, listPublicCalendarTenantEvents } from '@calendar/core/tenants'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	const env = await buildEnv(event.platform)
	const tenant = await getCalendarTenantBySlug(env.DB, event.params.tenant)
	if (!tenant || tenant.visibility !== 'public') {
		throw error(404, 'Organizer not found')
	}
	const events = await listPublicCalendarTenantEvents(env.DB, {
		tenantId: tenant.id
	})
	return { tenant, events }
}

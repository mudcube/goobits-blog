import { buildEnv } from '@calendar/kit'
import { getEnabledCalendarPrograms } from '@calendar/core/admin'
import { getDefaultCalendarTenant, listPublicCalendarTenantEvents } from '@calendar/core/tenants'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ platform }) => {
	const env = await buildEnv(platform)
	const [activities, defaultTenant] = await Promise.all([
		getEnabledCalendarPrograms(env.DB),
		getDefaultCalendarTenant(env.DB)
	])
	const upcoming = defaultTenant
		? await listPublicCalendarTenantEvents(env.DB, {
			tenantId: defaultTenant.id,
			limit: 6
		})
		: []

	return {
		activities,
		upcoming
	}
}

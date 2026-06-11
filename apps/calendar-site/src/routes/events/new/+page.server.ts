import { redirect } from '@sveltejs/kit'
import { buildEnv, getCalendarUserId } from '@calendar/kit'
import { getEnabledCalendarPrograms } from '@calendar/core/admin'
import { ensureCalendarCreatorTenant } from '@calendar/core/tenants'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	const userId = getCalendarUserId(event)
	if (!userId) throw redirect(303, `/login?redirect=${encodeURIComponent('/events/new')}`)

	const env = await buildEnv(event.platform)
	const tenant = await ensureCalendarCreatorTenant(env.DB, { userId })
	const programs = await getEnabledCalendarPrograms(env.DB)
	return {
		tenant,
		programs: programs.map((program) => ({
			slug: program.slug,
			label: program.label,
			description: program.description,
			icon: program.icon
		}))
	}
}

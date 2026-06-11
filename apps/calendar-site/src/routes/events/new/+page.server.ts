import { redirect } from '@sveltejs/kit'
import { buildEnv, getCalendarUserId } from '@calendar/kit'
import { getEnabledCalendarPrograms } from '@calendar/core/admin'
import { ensureCalendarTenantForUser } from '@calendar/core/tenants'
import type { PageServerLoad } from './$types'

async function getCalendarUserName(db: Awaited<ReturnType<typeof buildEnv>>['DB'], userId: string) {
	const row = await db
		.prepare(`SELECT name FROM calendar_users WHERE id = ? LIMIT 1`)
		.bind(userId)
		.first<{ name: string | null }>()
	return row?.name?.trim() || 'Organizer'
}

export const load: PageServerLoad = async (event) => {
	const userId = getCalendarUserId(event)
	if (!userId) throw redirect(303, `/login?redirectTo=${encodeURIComponent('/events/new')}`)

	const env = await buildEnv(event.platform)
	const name = await getCalendarUserName(env.DB, userId)
	const tenant = await ensureCalendarTenantForUser(env.DB, {
		userId,
		name: name.endsWith('s') ? `${name} events` : `${name}'s events`
	})
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
